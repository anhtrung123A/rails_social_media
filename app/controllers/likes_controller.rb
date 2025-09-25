class LikesController < ApplicationController
  before_action :authenticate_user!
  include ActionView::RecordIdentifier
  include CreateAndSendNotification

  def create
    @post = Post.find(params[:post_id])
    @post.likes.find_or_create_by(user: current_user)
    create_and_send_notification_to(current_user, @post.author, @post, "like")
    interact
  end

  def destroy
    @post = Post.find(params[:post_id])
    like = @post.likes.find_by(user: current_user)
    like&.destroy
    interact
  end

  private

  def interact
    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: [
          turbo_stream.replace(dom_id(@post, :like_count), partial: "posts/like_count", locals: { post: @post }),
          turbo_stream.replace(dom_id(@post, :like_button), partial: "posts/like_button", locals: { post: @post })
        ]
      end
      format.html { redirect_to root_path }
    end
  end
end
