module ApplicationHelper
  def avatar_for(user, options = {})
    default_url = "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"

    avatar_url = user.avatar.attached? ? url_for(user.avatar) : default_url

    html_options = {
      alt: "User Avatar",
      class: "h-8 w-8 rounded-full object-cover"
    }.merge(options)

    image_tag(avatar_url, html_options)
  end
end