# Natural Scurry v1.0.4

A polished, multiplayer platformer featuring a brave mouse navigating through organic, hand-crafted levels.

## 🌟 Features

-   **Multiplayer Real-time Presence**: See other mice scurrying through the same levels in real-time.
-   **Mouse Tailor (Customization)**: Personalize your mouse's coat, ears, and snout colors.
-   **Live Global Chat**: Communicate with other players in the integrated menu.
-   **Dynamic Leaderboard**: Compete for the fastest times and most cheese collected across chapters.
-   **Procedural Level Elements**: Levels scale in difficulty, featuring moving platforms and hazardous spikes.
-   **Retro Audio System**: Custom synthesized sound effects for jumping, collecting, and world interactions.
-   **Natural Tones Aesthetic**: A beautiful "Swiss/Modern" design theme using an organic color palette.

## 🚀 Getting Started (Supabase Setup)

To enable the multiplayer, chat, and leaderboard features, you must connect a Supabase project:

1.  **Create a Project**: Go to [supabase.com](https://supabase.com) and create a new project.
2.  **Run the Schema**: 
    -   Go to the **SQL Editor** in your Supabase dashboard.
    -   Copy the contents of the `supabase.sql` file in this repository.
    -   Paste and **Run** the script.
3.  **Environment Variables**:
    -   Find your **Project URL** and **Anon Key** in Project Settings > API.
    -   Set them in your environment (or AI Studio Settings):
        -   `VITE_SUPABASE_URL`
        -   `VITE_SUPABASE_ANON_KEY`
4.  **Restart**: Restart the development server to apply the changes.

## 🎮 Controls

-   **Keyboard**: `WASD` or `Arrows` to move, `Space` or `W` to jump.
-   **Touch/Mouse**: Use the virtual **Drive** joystick on the left and the **Jump** button on the right.

## 🛠 Tech Stack

-   **Frontend**: React + Vite + TypeScript
-   **Styling**: Tailwind CSS + Motion (Framer Motion)
-   **Backend**: Supabase (Auth, Database, Realtime)
-   **Icons**: Lucide React
-   **Audio**: Web Audio API
