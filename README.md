# Audify — Modern Music Streaming Web Application

Audify is a high-performance, responsive music streaming web application built with React. It provides a comprehensive listening experience by integrating decentralized music catalogs with mainstream metadata services, offering a feature-rich interface comparable to industry-standard streaming platforms.

---

## Technical Overview

Audify is architected for a seamless browser-based listening experience, featuring unified search functionality, advanced queue management, and a dynamic "Now Playing" interface that adapts to the visual aesthetics of the active track.

### Tech Stack

* **Frontend Framework:** React.js (Vite)
* **Styling:** Tailwind CSS + DaisyUI
* **Icons:** Lucide React
* **State Management:** React Context API (PlayerContext)

---

## Data Architecture

Audify utilizes a dual-API integration strategy to balance catalog breadth with playback quality.

1. **Audius API (Primary Source)**
* **Function:** Provides access to a decentralized catalog of independent artist content.
* **Capability:** Enables full-length, high-fidelity track playback without regional restrictions.
* **Application:** Trending tracks, genre-based filtering, and primary search queries.


2. **iTunes Search API (Secondary/Metadata Source)**
* **Function:** Queries the iTunes global music database.
* **Capability:** Provides comprehensive metadata and high-resolution album artwork.
* **Limitations:** Playback is restricted to 30-second AAC previews.
* **Application:** Used for fallback search and enriching the UI with official visual assets.



---

## Key Features

### Playback and Queue Controls

* **Core Transport:** Integrated Play/Pause, Next, and Previous track navigation.
* **Precision Seekbar:** Custom-implemented seekbar featuring hardware-accelerated transitions and interactive hover states for accurate track positioning.
* **Volume Management:** Granular volume control with contextual mute/level state handling.
* **Queue Management:** Dedicated "Add to Queue" functionality, allowing users to build a persistent "Up Next" list.
* **Library Integration:** One-click "Like" functionality to save tracks to a persistent user library.
* **Playback Modes:** Advanced state handling for Shuffle and Looping (Repeat Off, Repeat All, Repeat One).

### Ambient User Interface

* **Dynamic Visuals:** The interface utilizes real-time image processing (blur, saturation, and brightness) to generate ambient backgrounds derived from album artwork.
* **Theming Engine:** A modular theme switcher enables rapid adjustment of the application's color palette.

### Navigation and Search

* **Unified Search:** A centralized search implementation that dynamically switches between trending content and real-time user input.
* **Filtering:** Context-aware genre chips that apply filters across both trending and search-driven result sets.

### Responsive Design

* **Layout Adaptability:** Desktop optimization utilizes a persistent navigation sidebar, while mobile environments leverage a streamlined tab-bar interface for improved ergonomics.
* **Now Playing Modal:** A comprehensive full-screen view encompassing high-resolution artwork, detailed playback metrics, and expanded transport controls.

---

## Project Structure

```text
src/
├── assets/                 # Static images and resources
├── components/
│   ├── AlbumArt.jsx        # Artwork display and ambient effects
│   ├── HomeView.jsx        # Primary landing, trending, and search
│   ├── LibraryViews.jsx    # User library and liked songs management
│   ├── NowPlayingModal.jsx # Full-screen playback overlay
│   ├── Pagination.jsx      # Navigation controls
│   ├── Player.jsx          # Persistent playback transport controls
│   ├── Sidebar.jsx         # Global navigation sidebar
│   ├── ThemesView.jsx      # Theme and UI customization settings
│   ├── TrackRow.jsx        # Reusable track list item component
│   └── Views.jsx           # Main layout container
├── context/
│   └── PlayerContext.jsx   # Global state (Queue, Audio, Playback logic)
├── services/
│   └── api.js              # Audius and iTunes API integration layer
└── App.jsx                 # Application root and routing

```

---

## Deployment

1. Clone the repository.
2. Install dependencies: `npm install`
3. Launch the development environment: `npm run dev`
4. Access the application at `http://localhost:3000`.

---