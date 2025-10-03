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
- **Private Messaging**: Send direct messages to other users
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
   git clone https://github.com/yourusername/socialconnect.git
   cd socialconnect
