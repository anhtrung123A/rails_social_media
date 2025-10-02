class SearchController < ApplicationController
  def index
    find_users_by_username_query = User.where("username like ?", "%#{params[:q]}%").arel
    find_users_by_full_name_query = User.where("full_name like ?", "%#{params[:q]}%").arel
    users_union_query = find_users_by_full_name_query.union(find_users_by_username_query)
    @users = User.from(users_union_query.as(User.table_name))
    @posts = Post.where("description like ?", "%#{params[:q]}")
    puts @posts
  end
end
