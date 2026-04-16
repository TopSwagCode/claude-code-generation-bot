// Random facts about My Little Pony
const ponyFacts = [
    "The show originally ran for 9 seasons from 2010 to 2019!",
    "Lauren Faust created the show based on the Hasbro toy line.",
    "Each of the Mane Six represents a different Element of Harmony.",
    "Twilight Sparkle's full name is Twilight Sparkle, not Princess Twilight!",
    "The voice of Twilight Sparkle is Tara Strong, who also voices many other characters.",
    "Rainbow Dash is the only pony who has performed a sonic rainboom twice in the series.",
    "Fluttershy is actually one year older than Pinkie Pie.",
    "Rarity's boutique is called 'Carousel Boutique' and is shaped like a carousel.",
    "Applejack is the only main character without a pet in the early seasons.",
    "Pinkie Pie's full name is Pinkamena Diane Pie.",
    "Discord was voiced by John de Lancie, who also played Q in Star Trek.",
    "The show has won several awards including a Daytime Emmy nomination.",
];

// Episode facts
const episodeFacts = [
    "The pilot episode was originally going to be a movie!",
    "Winter Wrap Up was the first song written for the series.",
    "The Cutie Mark Crusaders were inspired by the Powerpuff Girls.",
    "Many episodes were written by the same team that worked on Foster's Home for Imaginary Friends.",
    "The Season 4 finale was originally planned to be the series finale.",
    "Some episodes feature references to other popular movies and TV shows.",
    "The wedding episode was inspired by a real royal wedding!",
    "Discord's first appearance was inspired by classic cartoon villains.",
];

// Gallery items for random display
const galleryItems = [
    { emoji: "🦄✨", text: "Twilight Sparkle casting a powerful spell" },
    { emoji: "🌈⚡", text: "Rainbow Dash's legendary sonic rainboom" },
    { emoji: "🦋🌸", text: "Fluttershy singing to woodland creatures" },
    { emoji: "💎👗", text: "Rarity creating her latest fashion masterpiece" },
    { emoji: "🍎🌾", text: "Applejack working hard on the farm" },
    { emoji: "🎈🎉", text: "Pinkie Pie's surprise party for everypony" },
    { emoji: "👑🌟", text: "Princess Celestia raising the sun" },
    { emoji: "🌙💜", text: "Princess Luna watching over dreams" },
    { emoji: "🐉📜", text: "Spike delivering an important scroll" },
    { emoji: "🎭🌪️", text: "Discord causing magical chaos" },
];

// Function to show random pony fact
function showRandomFact() {
    const factSection = document.getElementById('random-fact');
    const factText = document.getElementById('fact-text');
    
    if (factSection && factText) {
        const randomFact = ponyFacts[Math.floor(Math.random() * ponyFacts.length)];
        factText.textContent = randomFact;
        factSection.style.display = 'block';
        
        // Add animation effect
        factSection.style.animation = 'none';
        setTimeout(() => {
            factSection.style.animation = 'fadeIn 0.5s ease';
        }, 10);
    }
}

// Function to show random episode fact
function showRandomEpisodeFact() {
    const factSection = document.getElementById('episode-fact');
    const factText = document.getElementById('episode-fact-text');
    
    if (factSection && factText) {
        const randomFact = episodeFacts[Math.floor(Math.random() * episodeFacts.length)];
        factText.textContent = randomFact;
        factSection.style.display = 'block';
        
        // Add animation effect
        factSection.style.animation = 'none';
        setTimeout(() => {
            factSection.style.animation = 'fadeIn 0.5s ease';
        }, 10);
    }
}

// Function to show random gallery item
function showRandomGalleryItem() {
    const gallerySection = document.getElementById('random-gallery');
    const galleryImg = document.getElementById('random-gallery-img');
    const galleryText = document.getElementById('random-gallery-text');
    
    if (gallerySection && galleryImg && galleryText) {
        const randomItem = galleryItems[Math.floor(Math.random() * galleryItems.length)];
        galleryImg.textContent = randomItem.emoji;
        galleryText.textContent = randomItem.text;
        gallerySection.style.display = 'block';
        
        // Add animation effect
        gallerySection.style.animation = 'none';
        setTimeout(() => {
            gallerySection.style.animation = 'fadeIn 0.5s ease';
        }, 10);
    }
}

// Add some interactive effects to buttons
document.addEventListener('DOMContentLoaded', function() {
    // Add click effects to all buttons
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Create ripple effect
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.6)';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            ripple.style.animation = 'ripple 0.6s ease-out';
            ripple.style.pointerEvents = 'none';
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add hover effects to character cards
    const characterCards = document.querySelectorAll('.character-card, .feature-card, .gallery-item');
    characterCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            this.style.boxShadow = '0 15px 35px rgba(233, 30, 99, 0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // Add navigation highlight for current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.style.background = '#e91e63';
            link.style.color = 'white';
        }
    });
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Add some magical sparkle effects (optional enhancement)
function createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.textContent = '✨';
    sparkle.style.position = 'fixed';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.fontSize = '20px';
    sparkle.style.zIndex = '1000';
    sparkle.style.animation = 'sparkle 2s ease-out forwards';
    
    sparkle.style.left = Math.random() * window.innerWidth + 'px';
    sparkle.style.top = Math.random() * window.innerHeight + 'px';
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        sparkle.remove();
    }, 2000);
}

// Add CSS for sparkle animation
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
    @keyframes sparkle {
        0% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
        }
        50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
        }
        100% {
            opacity: 0;
            transform: scale(0) rotate(360deg);
        }
    }
`;
document.head.appendChild(sparkleStyle);

// Create sparkles occasionally (every 3-5 seconds)
setInterval(() => {
    if (Math.random() < 0.3) { // 30% chance every interval
        createSparkle();
    }
}, 3000);