import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  open(event) {
    event.preventDefault()
    const url = event.currentTarget.dataset.followersModalUrl
    if (url) {
      Turbo.visit(url, { frame: "followers_modal" })
    }
  }

  close(event) {
    event.preventDefault()
    const frame = document.getElementById("followers_modal_")
    if (frame) frame.remove() // clear modal content
  }
}