Rails.application.routes.draw do
  resources :follows, only: [ :create, :destroy ]
  resources :profiles, controller: "users", only: [ :show, :edit, :update ] do
    resource :follow, only: [ :create, :destroy, :show ]
  end
  resources :posts do
    resource :like, only: [ :create, :destroy ]
    resources :comments, only: [ :create, :destroy ]
    resource :comments, only: [ :show ]
    resource :share, only: [ :create, :destroy ]
  end
  resources :conversations, only: [ :index, :show, :create ] do
    resources :messages, only: [ :create ]
  end
  resources :notifications, only: [ :index, :show ] do
    collection do
      post :mark_all_as_read
      get :get_number_of_unread_notifications
      get :get_number_of_unread_messages
    end
  end
  get "search", to: "search#index"
  devise_for :users
  root "home#index"
end
