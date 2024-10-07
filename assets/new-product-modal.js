class customProductModal extends HTMLElement {
  constructor() {
    super();
    this.modalContainer = this.querySelector("[data-custom-modal]");
    this.addToCartButton = this.querySelector("[data-custom-modal-button]");
    this.form = document.querySelector('form[data-type="add-to-cart-form"]');
  }

  connectedCallback() {
    if (this.addToCartButton) {
      this.addToCartButton.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          // console.log(this.form)
          // console.log(this.addToCartButton)
          // console.log(this.addToCartButton)
          // document.body.appendChild(this.modalContainer);
          this.modalContainer.classList.remove("hide-modal");
          document.body.style.overflow = "hidden";
        }
      );
    }
   

    this.modalContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("custom-modal__background")) {
        e.currentTarget.classList.add("hide-modal");
        document.body.style.overflow = "auto";
        // document.body.removeChild(this.modalContainer);
      }
    });
  }
}

if (!window.customElements.get("custom-product-modal")) {
  customElements.define("custom-product-modal", customProductModal);
}
