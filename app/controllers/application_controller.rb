class ApplicationController < ActionController::Base
  before_action :configure_permitted_parameters, if: :devise_controller?
  allow_browser versions: :modern
  protected

  def configure_permitted_parameters
    # For sign up
    devise_parameter_sanitizer.permit(:sign_up, keys: [ :username ])

    # For account update/edit
    devise_parameter_sanitizer.permit(:account_update, keys: [ :username ])

    def after_sign_in_path_for(resource)
      stored_location_for(resource) || root_path
    end

    def after_sign_out_path_for(resource)
      new_user_session_path
    end

    def after_sign_up_path_for(resource)
      new_user_session_path
    end
  end
end
