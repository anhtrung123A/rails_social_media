class CommentsController < ApplicationController
  before_action :authenticate_user!

  def show
    @post = Post.eager_load(:comments).find(params[:post_id])
    @comments = @post.comments.order(created_at: :desc)
  end

  def create
    @post = Post.find(params[:post_id])
    @comment = @post.comments.build(comment_params)
    @comment.user = current_user
    @comment.save!
  end

  def destroy
    puts params[:id]
    puts @comment = Post.find(params[:post_id]).comments
  end

  private

  def comment_params
    params.require(:comment).permit(:content)
  end
end
