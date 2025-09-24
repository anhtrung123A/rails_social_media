class UsersController < ApplicationController
  include SetCurrentUser
  before_action :authenticate_user!, only: [ :edit, :update ]
  before_action :set_user, only: [ :edit, :update ]
  def edit
    @user = current_user
  end

  def update
    if params[:user][:remove_avatar] == "1"
      @user.avatar.purge
    end

    if @user.update(user_params.except(:remove_avatar))
      redirect_to profile_url(@user), notice: "Profile updated successfully."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def show
    @user = User.eager_load(:posts).find(params[:id])
    # Get the Arel tables
    posts_table = Post.arel_table
    shares_table = Share.arel_table
    
    # Build the queries
    shared_posts_query = Post.joins(:shares)
                            .where(shares: { user_id: @user.id })
                            .select('posts.id, posts.description, posts.author_id, shares.created_at, posts.updated_at')
                            .arel
                            
    authored_posts_query = Post.where(author_id: @user.id).arel
    
    # Execute the union
    union_query = shared_posts_query.union(authored_posts_query)
    
    # Create a new relation from the union query
    @posts = Post.from(union_query.as(Post.table_name))
                .order(created_at: :desc)
                .page(params[:page])
                .per(5)
    respond_to do |format|
      format.html
      format.turbo_stream
    end
  end

  private

  def user_params
    params.require(:user).permit(:username, :avatar, :remove_avatar, :bio, :birthday, :full_name)
  end
end
