class PostsController < ApplicationController
  before_action :authenticate_user!

  def create
    @post = current_user.posts.build(post_params)
    if @post.save
      redirect_to root_path, notice: "Post created!"
    else
      redirect_to root_path, alert: "Something went wrong."
    end
  end

  def index
    @posts = Post.includes(:author, images_attachments: :blob).order(created_at: :desc).page(params[:page]).per(5)
  end

  private

  def post_params
    params.require(:post).permit(:description, images: [])
  end
end
