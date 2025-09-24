class ConversationsController < ApplicationController
  before_action :authenticate_user!

  def index
    @conversations = current_user.conversations.includes(:sender, :recipient)
  end

  def show
    @conversation = find_conversation
    @message = Message.new
    @messages = @conversation.messages.includes(:sender, :recipient).order(:created_at)
    @messages.where(recipient_id: current_user.id, read: false).update_all(read: true)
  end

  def create
    recipient = User.find(params[:user_id])
    @conversation = Conversation.between(current_user.id, recipient.id).first

    unless @conversation
      @conversation = Conversation.create!(
        sender: current_user,
        recipient: recipient
      )
    end

    redirect_to conversation_path(@conversation)
  end

  private

  def find_conversation
    Conversation.find(params[:id])
  end
end
