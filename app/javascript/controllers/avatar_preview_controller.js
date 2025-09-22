import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="avatar-preview"
export default class extends Controller {
  static targets = ["input", "preview"]

  previewAvatar() {
    const file = this.inputTarget.files[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.previewTarget.src = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }
}