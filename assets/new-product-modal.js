class customProductModal extends HTMLElement {
  constructor() {
    super();
    this.modalContainer = this.querySelector("[data-custom-modal]");
    this.addToCartOpenButton = this.querySelector("[data-custom-modal-button]");
    this.addToCartCloseButton = this.querySelector(
      "[data-custom-modal-close-add-button]"
    );
    this.closeButton = this.querySelector("[data-custom-modal-close-button]");
    this.productId = this.getAttribute("data-product-id");
    this.showModalOnlyOnce =
      this.getAttribute("data-show-modal-only-once") === "true";
    this.completeTheLook = this.querySelectorAll("[data-complete-the-look]");
    this.completeTheLookFirstProduct = null;
    this.completeTheLookSecondProduct = null;
    this.addCompleteTheLookButton = this.querySelector(
      "[data-custom-modal-add-complete-the-look]"
    );
    this.cart =
      document.querySelector("cart-notification") ||
      document.querySelector("cart-drawer");
    this.sectionId = this.getAttribute("data-section-id");
    this.productHandle = this.getAttribute("data-product-title");
    this.variantId = this.getAttribute("data-variant-id");
    this.cookieName = "show-modal-once";
  }

  connectedCallback() {
    this.setEventListeners();
    this.getCompleteTheLookData();
  }

  getCompleteTheLookData() {
    this.completeTheLookFirstProduct = this.completeTheLook[0].getAttribute(
      "data-complete-the-look"
    );
    this.completeTheLookSecondProduct = this.completeTheLook[1].getAttribute(
      "data-complete-the-look"
    );
  }

  async addToCart(isMultiply = false) {
    if (
      this.productId &&
      this.completeTheLookFirstProduct &&
      this.completeTheLookSecondProduct
    ) {
      let formData;
      if (isMultiply) {
        formData = {
          items: [
            {
              id: this.productId,
              quantity: 1,
            },
            {
              id: this.completeTheLookFirstProduct,
              quantity: 1,
            },
            {
              id: this.completeTheLookSecondProduct,
              quantity: 1,
            },
          ],
        };
      } else {
        formData = {
          items: [
            {
              id: this.productId,
              quantity: 1,
            },
          ],
        };
      }
      try {
        const request = await fetch(
          window.Shopify.routes.root + "cart/add.js",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );
        const {items} = await request.json();
        const sections = this.cart
          .getSectionsToRender()
          .map((section) => section.id)
          .join(",");
        await fetch(`/?section_id=${this.sectionId}&sections=${sections}`)
          .then((response) => response.json())
          .then((data) => {
            const parser = new DOMParser();
            const products = parser.parseFromString(
              data["cart-notification-product"],
              "text/html"
            );
            if (isMultiply) {
              document.getElementById("cart-notification-product").innerHTML =
                data["cart-notification-product"];
            } else {
              document.getElementById("cart-notification-product").innerHTML =
                products.getElementById(
                  `cart-notification-product-${items[0].key}`
                ).innerHTML;
            }

            document.getElementById("cart-notification-button").innerHTML =
              data["cart-notification-button"];

            document.getElementById("cart-icon-bubble").innerHTML =
              data["cart-icon-bubble"];
          });

        const res = await fetch(
          `/${this.productHandle}?variant=${this.variantId}&section_id=${this.sectionId}`
        );
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const sectionHtml = doc.querySelector(
          `#Quantity-Form-${this.sectionId}`
        ).innerHTML;
        document.getElementById(`Quantity-Form-${this.sectionId}`).innerHTML =
          sectionHtml;
        this.cart.open();
      } catch (error) {
        console.warn("Error:", error);
      }
    }
  }

  setEventListeners() {
    if (this.addToCartOpenButton) {
      console.log(this.showModalOnlyOnce)
      this.addToCartOpenButton.addEventListener("click", (e) => {
        if (this.showModalOnlyOnce) {
          const isCookieExist = this.checkCookie();
          if (!isCookieExist) {
            this.createCookie();
            e.preventDefault();
            this.openModal();
          }
        } else {
          this.checkCookie() ? this.deleteCookie() : null;
          e.preventDefault();
          this.openModal();
        }
      });
    }

    if (this.addToCartCloseButton) {
      this.addToCartCloseButton.addEventListener("click", async (e) => {
        e.preventDefault();
        await this.addToCart();
        this.closeModal();
      });
    }

    if (this.closeButton) {
      this.closeButton.addEventListener("click", () => {
        this.closeModal();
      });
    }

    if (this.modalContainer) {
      this.modalContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("custom-modal__background")) {
          this.closeModal();
        }
      });
    }

    if (this.addCompleteTheLookButton) {
      this.addCompleteTheLookButton.addEventListener("click", async () => {
        await this.addToCart(true);
        this.closeModal();
      });
    }
  }

  closeModal() {
    this.modalContainer.classList.add("hide-modal");
    document.body.classList.remove("stop-scroll");
  }

  openModal() {
    this.modalContainer.classList.remove("hide-modal");
    document.body.classList.add("stop-scroll");
  }

  createCookie() {
    if (this.showModalOnlyOnce) {
      const now = new Date();
      now.setTime(now.getTime() + 24 * 60 * 60 * 1000);
      document.cookie = `${
        this.cookieName
      }=productId-${this.productId};expires=${now.toUTCString()};path=/`;
    }
  }

  checkCookie(name) {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      if (cookie.trim().startsWith(`${this.cookieName}=`)) {
        return true;
      }
    }
    return false;
  }

  deleteCookie() {
    document.cookie = `${this.cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
  }
}

if (!window.customElements.get("custom-product-modal")) {
  customElements.define("custom-product-modal", customProductModal);
}
