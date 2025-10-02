class NotificationsChannel < ApplicationCable::Channel
  def subscribed
    puts params
    if params[:user_id]
      user = User.find_by(id: params[:user_id])
      if user && current_user
        stream_from("notifications_#{current_user.id}")
      else
        reject
      end
    else
      reject
    end
  end

  def unsubscribed
  end

  def speak(data)
    direct_object = user.find_by(id: data["direct_object_id"])
    indirect_object = user.find_by(id: data["indirect_object_id"])
    action = data["action"]
  end
end
