# app/controllers/messages_controller.rb
class MessagesController < ApplicationController
  before_action :authenticate_user!
  
  def create
    @conversation = Conversation.find(params[:conversation_id])
    @message = @conversation.messages.build(
      sender: current_user,
      recipient: @conversation.other_user(current_user),
      content: params[:message][:content]
    )
    
    if @message.save
      head :ok
    else
      render json: { errors: @message.errors }, status: :unprocessable_entity
    end
  end
end