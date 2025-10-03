class PresenceChannel < ApplicationCable::Channel
  def subscribed
    return reject unless current_user
    stream_from "user_presence_updates"
  end
end
