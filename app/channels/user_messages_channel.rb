# app/channels/user_messages_channel.rb
class UserMessagesChannel < ApplicationCable::Channel
  def subscribed
    if current_user && params[:user_id].to_i == current_user.id
      stream_from "user_#{current_user.id}_messages"
    else
      reject
    end
  end

  def unsubscribed
    # Cleanup if needed
  end
end
