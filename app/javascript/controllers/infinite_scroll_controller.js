import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["trigger"]

  connect() {
    if (this.hasTriggerTarget) {
      this.observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.querySelector("a")?.click()
          }
        })
      })
      this.observer.observe(this.triggerTarget)
    }
  }

  disconnect() {
    if (this.observer && this.hasTriggerTarget) {
      this.observer.unobserve(this.triggerTarget)
    }
  }
}
