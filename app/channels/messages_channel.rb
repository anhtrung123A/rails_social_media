# app/channels/messages_channel.rb
class MessagesChannel < ApplicationCable::Channel
  def subscribed
    # Verify that the user has access to this conversation
    if params[:conversation_id]
      conversation = Conversation.find_by(id: params[:conversation_id])
      if conversation && (conversation.sender == current_user || conversation.recipient == current_user)
        stream_from "messages_#{params[:conversation_id]}"
        # Also stream to user's personal channel for notifications
      else
        reject
      end
    else
      stream_from "user_#{current_user.id}_messages"
    end
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def speak(data)
    conversation = Conversation.find(data["conversation_id"])

    # Verify user has access to this conversation
    unless conversation.sender == current_user || conversation.recipient == current_user
      return
    end

    message = conversation.messages.build(
      sender: current_user,
      recipient: conversation.other_user(current_user),
      content: data["message"]
    )

    if message.save
      # recipient = conversation.other_user(current_user)
      # ActionCable.server.broadcast("user_#{recipient.id}_messages",{ type: "new_message",
      #   conversation_id: conversation.id,
      #   sender_name: current_user.full_name,
      #   message_preview: message.content.truncate(50)})
      # Broadcast to conversation channel
      # ActionCable.server.broadcast "messages_#{conversation.id}",
      #   message: message.content,
      #   sender: message.sender.full_name,
      #   conversation_id: conversation.id,
      #   created_at: message.created_at.strftime("%H:%M"),
      #   id: message.id

      # Also broadcast to recipient's personal channel for notification
    end
  end
end
