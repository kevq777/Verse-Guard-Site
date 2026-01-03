/**
 * THE STRONGHOLD - Living Tabernacle
 * Handles the Vigil (Lanterns), Digital Empathy (Hover), and Ignition.
 */

const CONFIG = {
    lanternCount: 40,
    colors: {
        wick: '#fff7ed',
        flame: '#fbbf24',
        glow: 'rgba(245, 158, 11, 0.4)'
    },
    mockStewards: [
        { city: 'London', struggle: 'Lust' },
        { city: 'Seoul', struggle: 'Sloth' },
        { city: 'Dallas', struggle: 'Anger' },
        { city: 'Nairobi', struggle: 'Procrastination' },
        { city: 'Berlin', struggle: 'Despair' },
        { city: 'Tokyo', struggle: 'Distraction' },
        { city: 'Sao Paulo', struggle: 'Pride' },
        { city: 'New York', struggle: 'Greed' },
        { city: 'Cairo', struggle: 'Lust' },
        { city: 'Sydney', struggle: 'Sloth' }
    ],
    MAX_PARTICLES: 100 // HARD LIMIT: Prevent DoS
};

class Vigil {
    constructor() {
        this.canvas = document.getElementById('vigil-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.tooltip = document.getElementById('vigil-tooltip');
        this.tooltipText = document.getElementById('tooltip-content');
        this.lanterns = [];
        this.width = 0;
        this.height = 0;
        this.mouse = { x: 0, y: 0 };
        this.hoveredLantern = null;
        this.userLantern = null; // Will be the object when user lights it
        this.hasIgnited = false; // SECURITY: Rate Limit (One stand per session)

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Populate Background Lanterns
        for (let i = 0; i < CONFIG.lanternCount; i++) {
            this.lanterns.push(this.createLantern());
        }

        // Mouse Tracking for Tooltip
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            this.checkHover();
        });

        // Setup Interaction
        this.setupInteraction();

        // Start Loop
        this.animate();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    createLantern(isUser = false, triggerX, triggerY) {
        // SECURITY: Particle Cap
        if (this.lanterns.length >= CONFIG.MAX_PARTICLES) {
            this.lanterns.shift(); // Remove oldest to make room
        }

        // Assign random identity
        const identity = CONFIG.mockStewards[Math.floor(Math.random() * CONFIG.mockStewards.length)];

        return {
            x: isUser ? triggerX : Math.random() * this.width,
            y: isUser ? triggerY : this.height + Math.random() * 200,
            size: Math.random() * 3 + 2, // Base size
            speedY: Math.random() * 0.4 + 0.1, // Float speed
            speedX: (Math.random() - 0.5) * 0.2, // Drift
            swayOffset: Math.random() * Math.PI * 2, // For gentle sway
            opacity: 0, // Start invisible, fade in
            targetOpacity: Math.random() * 0.3 + 0.6,
            life: 1.0,
            isUser: isUser,
            identity: isUser ? { city: 'You', struggle: 'Standing Firm' } : identity
        };
    }

    setupInteraction() {
        const lanternBtn = document.getElementById('user-lantern-btn');
        const menu = document.getElementById('stand-menu');
        const label = document.getElementById('action-label');
        const zone = document.getElementById('interaction-zone');

        // Click Lantern -> Show Menu
        lanternBtn.addEventListener('click', () => {
            if (this.hasIgnited) return; // Prevent spam
            if (zone.classList.contains('ignited')) return;
            menu.classList.add('active');
            label.innerText = 'Choose your stand...';
        });

        // Click Option -> Ignite
        document.querySelectorAll('.stand-option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                if (this.hasIgnited) return; // double-check

                const struggle = e.target.dataset.struggle;
                this.igniteUserLantern(struggle);
                menu.classList.remove('active');
            });
        });
    }

    igniteUserLantern(struggle) {
        if (this.hasIgnited) return;
        this.hasIgnited = true; // Lock it down

        const zone = document.getElementById('interaction-zone');
        const label = document.getElementById('action-label');
        const lanternIcon = document.getElementById('user-lantern-btn');
        const testament = document.getElementById('testament');

        // UI Updates
        zone.classList.add('ignited');
        label.innerText = `Resisting ${struggle}`;

        // Reveal James 1:2-4
        testament.classList.add('revealed');

        // Visual effect: Fade out DOM icon, Spawn Canvas Lantern
        setTimeout(() => {
            lanternIcon.style.opacity = '0'; // Hide DOM
            label.style.opacity = '0.7';

            // Spawn the "User" lantern at the exact position
            const rect = lanternIcon.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            this.userLantern = this.createLantern(true, centerX, centerY);
            this.userLantern.opacity = 1; // Instant bright
            this.userLantern.identity.struggle = struggle; // Override
            this.userLantern.speedY = 1.5; // Starts fast then slows

            this.lanterns.push(this.userLantern);
        }, 500); // Wait for CSS transition
    }

    checkHover() {
        let hoverFound = false;

        // Simple distance check
        for (let l of this.lanterns) {
            const dx = this.mouse.x - l.x;
            const dy = this.mouse.y - l.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 30) { // Hover radius
                this.hoveredLantern = l;
                hoverFound = true;
                break;
            }
        }

        if (hoverFound && this.hoveredLantern) {
            this.showTooltip(this.hoveredLantern);
        } else {
            this.hideTooltip();
            this.hoveredLantern = null;
        }
    }

    showTooltip(lantern) {
        const i = lantern.identity;
        // Text depending on if it's YOU or OTHERS
        if (lantern.isUser) {
            this.tooltipText.innerHTML = `You are <span class="tooltip-highlight">Standing Firm</span>`;
        } else {
            // Generate a realistic "recent" time (e.g. 12:05)
            const now = new Date();
            const minutesAgo = Math.floor(Math.random() * 60); // 0-60 mins ago
            now.setMinutes(now.getMinutes() - minutesAgo);
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            this.tooltipText.innerHTML = `A Steward in ${i.city} resisting <span class="tooltip-highlight">${i.struggle}</span> at ${timeStr}`;
        }

        this.tooltip.style.opacity = '1';
        this.tooltip.style.left = this.mouse.x + 'px';
        this.tooltip.style.top = this.mouse.y + 'px';
    }

    hideTooltip() {
        this.tooltip.style.opacity = '0';
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw Lanterns
        this.lanterns.forEach((l, index) => {
            // Movement
            l.y -= l.speedY; // Up!
            l.x += Math.sin(Date.now() / 1000 + l.swayOffset) * 0.2; // Sway

            // Fade In Logic
            if (l.opacity < l.targetOpacity) l.opacity += 0.005;

            // Rendering (The Glow)
            const gradient = this.ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.size * 4);
            gradient.addColorStop(0, `rgba(255, 247, 237, ${l.opacity})`); // Wick (White)
            gradient.addColorStop(0.2, `rgba(251, 191, 36, ${l.opacity})`); // Flame (Gold)
            gradient.addColorStop(1, `rgba(245, 158, 11, 0)`); // Glow (Fade)

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(l.x, l.y, l.size * 4, 0, Math.PI * 2);
            this.ctx.fill();

            // Reset loop (only for background bots)
            if (!l.isUser && l.y < -50) {
                l.y = this.height + 50;
                l.x = Math.random() * this.width;
            }
            // User lantern slows down to join the pack
            if (l.isUser && l.speedY > 0.3) {
                l.speedY *= 0.98;
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Vigil();
});
