<template>
  <div class="product-container">
    <div v-for="(product, index) in products" :key="index" class="product-card">
      <img :src="product.image" :alt="product.title" class="product-image" />
      <h3>{{ product.title }}</h3>
      <p>{{ product.description }}</p>
      <p>{{ product.price }} {{ product.currency }}</p>

      <button 
        v-if="product.title === '2xTap'" 
        @click="buyProductGenerateInvoice" 
        :disabled="canDoubleTap"
        class="clickable-button"
      >
        50 Stars
      </button>
      <button 
        v-if="product.title === 'Starter Pack'" 
        @click="buyProductStarterPack"
        class="clickable-button"
      >
        100 Stars
      </button>

      <p v-if="canDoubleTap">Теперь вы можете тапать дважды!</p>
    </div>
  </div>
</template>

<script>
import image2xTap from '@/assets/2xtap.png';
import pack from '@/assets/pack.png';
import { useScoreStore } from "@/stores/score";
import { updateScore, updateCarrotScore } from '@/api/app';

export default {
  data() {
    return {
      products: [
        {
          title: 'Starter Pack',
          description: '10k Rabby 1k Caro',
          image: pack,
          price: 100,
          currency: 'Stars',
        },
      ],
      canDoubleTap: false,
      paymentInProgress: false,
    };
  },
  methods: {
    async fetchInvoiceAndCheckPayment(url) {
      if (this.paymentInProgress) return;
      this.paymentInProgress = true;

      try {
        const response = await fetch(url);
        const data = await response.json();
        const invoiceLink = data.invoiceLink;

        if (invoiceLink) {
          window.open(invoiceLink, '_blank');
          this.checkPaymentStatus(data.paymentId);
        } else {
          console.error('Invoice not found');
        }
      } catch (error) {
        console.error('Error while fetching invoice:', error);
      } finally {
        this.paymentInProgress = false;
      }
    },

    async checkPaymentStatus(paymentId) {
      try {
        if (!paymentId) {
          console.error('Payment ID is not available');
          return;
        }
        const url = `http://localhost:8080/payment-status/${paymentId}`;
        const response = await fetch(url);
        const data = await response.json();

        console.log('Payment Status:', data);

        this.handleInvoiceStatus(data.status, data.productTitle);
      } catch (error) {
        console.error('Error while checking payment status:', error);
        this.handleInvoiceStatus('failed');
      }
    },

    async handleInvoiceStatus(status, productTitle = '') {
      const store = useScoreStore();

      if (status === 'paid') {
        if (productTitle === 'Starter Pack') {
          store.add(10000);
          store.addCarrot(1000);
        } else if (productTitle === '2xTap') {
          this.canDoubleTap = true;
        }

        await updateScore(store.score);
        await updateCarrotScore(store.carrotScore);
        console.log('Payment successful');
        this.showCustomPopup('Спасибо за покупку!');
      } else {
        this.handleFailedPayment(productTitle);
      }
    },

    handleFailedPayment(productTitle) {
      const store = useScoreStore();
      if (productTitle === 'Starter Pack') {
        store.add(10000);
        store.addCarrot(1000);
      } else if (productTitle === '2xTap') {
        this.canDoubleTap = true;
      }

      store.add(10000);
      store.addCarrot(1000);
      console.log('Payment failed but rewards given');
      this.showCustomPopup('Что-то пошло не так, но бонусы начислены');
    },

    showCustomPopup(message) {
      alert(message);
    },

    buyProductStarterPack() {
      this.fetchInvoiceAndCheckPayment('http://localhost:8080/pack-invoice');
    },

    buyProductGenerateInvoice() {
      this.fetchInvoiceAndCheckPayment('http://localhost:8080/2xtap-invoice');
    },
  },
};
</script>

<style scoped>
.product-container {
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding: 10px;
  white-space: nowrap;
}

.product-card {
  border: 1px solid #dddddd00;
  padding: 8px;
  width: 180px;
  box-sizing: border-box;
  text-align: center;
  background-color: #dbeafe;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: inline-block;
  vertical-align: top;
}

.product-card h3 {
  font-size: 1rem;
  margin-bottom: 6px;
}

.product-card p {
  font-size: 0.9rem;
  margin-bottom: 6px;
}

.product-image {
  width: 60%;
  max-height: 100px;
  object-fit: cover;
  margin-bottom: 8px;
}

button {
  background-color: #facc15;
  color: #f9fafb;
  padding: 12px 24px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  border-radius: 8px;
  margin-top: 6px;
  width: 100%;
  box-sizing: border-box;
}

button:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
}

button:hover {
  background-color: #fbbf24;
}

.clickable-button {
  display: inline-block;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 8px;
  text-align: center;
  padding: 14px;
  margin-top: 12px;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.clickable-button:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
}

.clickable-button:hover {
  background-color: #fbbf24;
}
</style>
