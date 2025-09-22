class HomeController < ApplicationController
  def index
    @post = Post.new
    @posts = Post.eager_load(:author).order(created_at: :desc).page(params[:page]).per(5)

    respond_to do |format|
      format.html
      format.turbo_stream
    end
  end
end
