class customProductModal extends HTMLElement {
  constructor() {
    super();
    this.modalContainer = this.querySelector("[data-custom-modal]");
  }

  connectedCallback() {
    this.querySelector("[data-custom-modal-button]").addEventListener(
      "click",
      (e) => {
        document.body.appendChild(this.modalContainer);
        this.modalContainer.classList.remove("hide-modal");
      }
    );

    this.modalContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("custom-modal__background")) {
        e.currentTarget.classList.add("hide-modal");
        document.body.removeChild(this.modalContainer);
      }
    });
  }
}

if (!window.customElements.get("custom-product-modal")) {
  customElements.define("custom-product-modal", customProductModal);
}
