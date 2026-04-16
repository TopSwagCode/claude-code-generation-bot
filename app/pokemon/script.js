class PokemonApp {
    constructor() {
        this.pokemonData = [];
        this.allPokemon = [];
        this.currentOffset = 0;
        this.limit = 20;
        this.isLoading = false;
        
        this.elements = {
            loading: document.getElementById('loading'),
            pokemonGrid: document.getElementById('pokemon-grid'),
            loadMoreBtn: document.getElementById('load-more-btn'),
            loadMoreSection: document.getElementById('load-more-section'),
            searchInput: document.getElementById('search-input')
        };
        
        this.init();
    }
    
    async init() {
        await this.loadPokemon();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.elements.loadMoreBtn.addEventListener('click', () => {
            this.loadPokemon();
        });
        
        let searchTimeout;
        this.elements.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 300);
        });
    }
    
    async loadPokemon() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();
        
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${this.limit}&offset=${this.currentOffset}`);
            const data = await response.json();
            
            const pokemonDetails = await Promise.all(
                data.results.map(pokemon => this.fetchPokemonDetails(pokemon.url))
            );
            
            this.pokemonData.push(...pokemonDetails);
            this.allPokemon.push(...pokemonDetails);
            this.currentOffset += this.limit;
            
            this.renderPokemon(pokemonDetails);
            
            if (data.next) {
                this.showLoadMoreButton();
            } else {
                this.hideLoadMoreButton();
            }
            
        } catch (error) {
            console.error('Error loading Pokemon:', error);
            this.showError('Failed to load Pokemon. Please try again.');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }
    
    async fetchPokemonDetails(url) {
        try {
            const response = await fetch(url);
            const pokemon = await response.json();
            
            return {
                id: pokemon.id,
                name: pokemon.name,
                image: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default,
                types: pokemon.types.map(type => type.type.name)
            };
        } catch (error) {
            console.error(`Error fetching Pokemon details from ${url}:`, error);
            return null;
        }
    }
    
    renderPokemon(pokemonList) {
        const fragment = document.createDocumentFragment();
        
        pokemonList.forEach(pokemon => {
            if (!pokemon) return;
            
            const card = this.createPokemonCard(pokemon);
            fragment.appendChild(card);
        });
        
        this.elements.pokemonGrid.appendChild(fragment);
    }
    
    createPokemonCard(pokemon) {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'gridcell');
        card.setAttribute('aria-label', `Pokemon: ${pokemon.name}`);
        
        const imageContainer = document.createElement('div');
        imageContainer.className = 'pokemon-image';
        
        const image = document.createElement('img');
        image.src = pokemon.image;
        image.alt = `${pokemon.name} artwork`;
        image.loading = 'lazy';
        
        image.onerror = () => {
            image.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
        };
        
        imageContainer.appendChild(image);
        
        const name = document.createElement('h2');
        name.className = 'pokemon-name';
        name.textContent = pokemon.name;
        
        const id = document.createElement('p');
        id.className = 'pokemon-id';
        id.textContent = `#${pokemon.id.toString().padStart(3, '0')}`;
        
        const typesContainer = document.createElement('div');
        typesContainer.className = 'pokemon-types';
        
        pokemon.types.forEach(type => {
            const typeElement = document.createElement('span');
            typeElement.className = 'pokemon-type';
            typeElement.textContent = type;
            typeElement.style.backgroundColor = this.getTypeColor(type);
            typesContainer.appendChild(typeElement);
        });
        
        card.appendChild(imageContainer);
        card.appendChild(name);
        card.appendChild(id);
        card.appendChild(typesContainer);
        
        return card;
    }
    
    getTypeColor(type) {
        const colors = {
            normal: '#A8A878',
            fire: '#F08030',
            water: '#6890F0',
            electric: '#F8D030',
            grass: '#78C850',
            ice: '#98D8D8',
            fighting: '#C03028',
            poison: '#A040A0',
            ground: '#E0C068',
            flying: '#A890F0',
            psychic: '#F85888',
            bug: '#A8B820',
            rock: '#B8A038',
            ghost: '#705898',
            dragon: '#7038F8',
            dark: '#705848',
            steel: '#B8B8D0',
            fairy: '#EE99AC'
        };
        
        return colors[type] || '#68A090';
    }
    
    handleSearch(query) {
        const filteredPokemon = this.allPokemon.filter(pokemon => 
            pokemon.name.toLowerCase().includes(query.toLowerCase()) ||
            pokemon.id.toString().includes(query) ||
            pokemon.types.some(type => type.toLowerCase().includes(query.toLowerCase()))
        );
        
        this.elements.pokemonGrid.innerHTML = '';
        
        if (query.trim() === '') {
            this.renderPokemon(this.pokemonData);
            this.showLoadMoreButton();
        } else {
            this.renderPokemon(filteredPokemon);
            this.hideLoadMoreButton();
            
            if (filteredPokemon.length === 0) {
                this.showNoResults();
            }
        }
    }
    
    showNoResults() {
        const noResults = document.createElement('div');
        noResults.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-secondary);';
        noResults.innerHTML = '<p>No Pokemon found matching your search.</p>';
        this.elements.pokemonGrid.appendChild(noResults);
    }
    
    showLoading() {
        this.elements.loading.classList.remove('hidden');
        this.elements.loadMoreBtn.disabled = true;
    }
    
    hideLoading() {
        this.elements.loading.classList.add('hidden');
        this.elements.loadMoreBtn.disabled = false;
    }
    
    showLoadMoreButton() {
        this.elements.loadMoreSection.classList.remove('hidden');
    }
    
    hideLoadMoreButton() {
        this.elements.loadMoreSection.classList.add('hidden');
    }
    
    showError(message) {
        const errorElement = document.createElement('div');
        errorElement.style.cssText = 'text-align: center; padding: 2rem; color: var(--text-secondary); grid-column: 1 / -1;';
        errorElement.innerHTML = `<p>${message}</p>`;
        this.elements.pokemonGrid.appendChild(errorElement);
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PokemonApp();
});