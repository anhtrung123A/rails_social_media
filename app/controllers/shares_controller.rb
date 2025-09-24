class SharesController < ApplicationController
  before_action :authenticate_user!
  include ActionView::RecordIdentifier

  def create
    @post = Post.find(params[:post_id])
    @post.shares.find_or_create_by(user: current_user)
    interact
  end

  def destroy
    @post = Post.find(params[:post_id])
    share = @share.shares.find_by(user: current_user)
    share&.destroy
    interact
  end

  private

  def interact
    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: [
          turbo_stream.replace(dom_id(@post, :share_count), partial: "posts/share_count", locals: { post: @post }),
          turbo_stream.replace(dom_id(@post, :share_button), partial: "posts/share_button", locals: { post: @post })
        ]
      end
      format.html { redirect_to root_path }
    end
  end
end
