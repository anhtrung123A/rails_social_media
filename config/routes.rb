Rails.application.routes.draw do
  resources :follows, only: [ :create, :destroy ]
  resources :profiles, controller: "users", only: [ :show, :edit, :update ] do
    resource :follow, only: [ :create, :destroy ]
  end
  resources :posts do
    resource :like, only: [ :create, :destroy ]
  end
  devise_for :users
  root "home#index"
end
