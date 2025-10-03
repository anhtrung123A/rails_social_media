# SocialConnect

A modern, full-stack social media platform built with Ruby on Rails, featuring real-time interactions, user profiles, posts, comments, sharing, following, and private messaging.

![Rails](https://img.shields.io/badge/Rails-7.0%2B-red?logo=ruby-on-rails)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12%2B-blue?logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0%2B-teal?logo=tailwind-css)
![Hotwire](https://img.shields.io/badge/Hotwire-Stimulus%20%2B%20Turbo-orange?logo=hotwire)
![Redis](https://img.shields.io/badge/Redis-6.0%2B-red?logo=redis)

## ✨ Features

- **User Authentication**: Sign up, log in, and manage your profile
- **Post Management**: Create and delete your own posts
- **Social Interactions**:
  - View posts from users you follow
  - Comment on posts
  - Share posts with your network
- **User Connections**: Follow and unfollow other users
- **Private Messaging**: Send direct messages to other users with ActionCable
- **Real-time Activity Status**: See who's online using Redis
- **Responsive UI**: Mobile-friendly design with Tailwind CSS
- **Live Updates**: Real-time interactions powered by Hotwire (Turbo Streams & Stimulus)

## 🛠️ Tech Stack

### Backend
- **Framework**: Ruby on Rails 7+
- **Database**: PostgreSQL
- **Real-time Backend**: Redis (for activity status and caching)
- **Authentication**: Devise or custom solution

### Frontend
- **Styling**: Tailwind CSS
- **JavaScript**: 
  - Hotwire Turbo (for real-time page updates)
  - Stimulus (for interactive UI components)
- **Asset Management**: Rails Import Maps

## 🚀 Getting Started

### Prerequisites
- Ruby 3.0+
- Rails 7.0+
- PostgreSQL 12+
- Redis 6.0+
- Node.js & Yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anhtrung123A/rails_social_media.git
   cd rails_social_media
   ```
2. **Install dependencies**
   ```bash
    bundle install
    yarn install
    ```
3. **Set up environment variables**\
  Create a .env file in the project root:
    ```bash
    DATABASE_URL=postgresql://localhost/mydb
    REDIS_URL=redis://localhost:6379
    ```
4. **Configure the database**
   ```bash
    rails db:setup
    # Or run separately:
    # rails db:create
    # rails db:migrate
    # rails db:seed (optional)
   ```
5. **Start Redis (in a new terminal tab/window)**
   ```bash
    redis-server
6. **Start the Rails server**
   ```bash
    rails server
7. **Visit the app**\
Open your browser to http://localhost:3000
## 📁 Project Structure Highlights

```plaintext
app/
├── models/               # User, Post, Comment, Message, Follow
├── controllers/          # Posts, Comments, Messages, Follows
├── channels/             # ApplicationCable, MessageChannel
├── javascript/
│   └── controllers/      # Stimulus controllers (post, comment, follow, etc.)
├── views/
│   └── posts/            # Includes Turbo Stream templates
config/
├── database.yml          # PostgreSQL config
└── redis.yml             # Redis connection settings
```
## 🤝 Contributing
Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (git checkout -b feature/your-feature)
3. Commit your changes (git commit -m 'Add your feature')
4. Push to the branch (git push origin feature/your-feature)
5. Open a Pull Request
## 📄 License
This project is licensed under the MIT License. See the LICENSE file for details.

## 🙌 Acknowledgements
- Hotwire – For making Rails frontend development joyful
- Tailwind CSS – Utility-first CSS framework
- Redis – In-memory data store for real-time features
