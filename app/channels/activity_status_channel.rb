# app/channels/activity_status_channel.rb
class ActivityStatusChannel < ApplicationCable::Channel
  def subscribed
    return reject unless current_user
    return reject unless params[:user_id].to_i == current_user.id

    stream_from "user_activity_status_#{current_user.id}"

    # Set current user online
    RedisService.set_user_online(current_user.id)

    # Notify others that THIS user is online
    broadcast_presence_update(current_user.id, true)
  end

  def unsubscribed
    if current_user
      RedisService.set_user_offline(current_user.id)
      # Notify others that THIS user went offline
      broadcast_presence_update(current_user.id, false)
    end
  end

  def heartbeat(data)
    user_id = data["user_id"].to_i
    if user_id == current_user.id
      RedisService.set_user_online(user_id)
      # Optional: refresh timestamp, but no need to rebroadcast "online" if already online
    end
  end

  private

  # Broadcast to a GLOBAL stream so ALL users can see status changes
  def broadcast_presence_update(user_id, is_online)
    ActionCable.server.broadcast("user_presence_updates", {
      user_id: user_id,
      status: is_online ? "online" : "offline",
      last_seen: RedisService.user_last_seen(user_id),
      timestamp: Time.current.iso8601
    })
  end
end
