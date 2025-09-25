class HomeController < ApplicationController
  def index
    @post = Post.new
    @posts = Post.with_attached_images.eager_load(:author).order(created_at: :desc).page(params[:page]).per(5)
  end
end
