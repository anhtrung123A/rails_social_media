class CommentsController < ApplicationController
  before_action :authenticate_user!, only: [ :create, :destroy ]
  include CreateAndSendNotification

  def show
    @post = Post.eager_load(:comments).find(params[:post_id])
    @comments = @post.comments.order(created_at: :desc)
  end

  def create
    @post = Post.find(params[:post_id])
    @comment = @post.comments.build(comment_params)
    @comment.user = current_user
    create_and_send_notification_to(current_user, @post.author, @post, "comment")
    if @comment.save
      respond_to do |format|
        format.turbo_stream
        format.html
      end
    else
      # Handle errors (optional for now)
      redirect_to post_path(@post), alert: "Comment could not be saved."
    end
  end

  def destroy
    @post = Post.find(params[:post_id])
    @comment = @post.comments.find(params[:id])
    @comment.destroy
    respond_to do |format|
      format.turbo_stream
      format.html { redirect_to @post }
    end
  end

  private

  def comment_params
    params.require(:comment).permit(:content)
  end
end
