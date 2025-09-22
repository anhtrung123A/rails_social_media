Rails.application.routes.draw do
  resources :profiles, controller: "users", only: [ :show, :edit, :update ]
  resources :posts do
    resource :like, only: [ :create, :destroy ]
  end

  devise_for :users
  root "home#index"
end
