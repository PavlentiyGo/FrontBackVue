<template>
  <div
    class="color-card"
    :style="{ backgroundColor: colorData.hex }"
    @click="onCardClick"
    :title="`Кликните, чтобы скопировать ${colorData.hex}`"
  >
    <button @click.stop="onPinClick" class="pin-btn" :class="{ pinned: colorData.pinned }">
      {{ colorData.pinned ? '📌' : '📍' }}
    </button>
    <div class="color-value">
      {{ showRGB ? colorData.rgb : colorData.hex }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorCard',
  props: {
    colorData: {
      type: Object,
      required: true,
      validator: (value) => {
        return value.hex && value.rgb && typeof value.pinned === 'boolean'
      }
    },
    showRGB: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click', 'toggle-pin'], 
  setup(props, { emit }) {
    const onCardClick = () => {
      emit('click', props.colorData.hex)
    }

    const onPinClick = () => {
      emit('toggle-pin')
    }

    return {
      onCardClick,
      onPinClick
    }
  }
}
</script>

<style scoped>
.color-card {
  position: relative;
  width: 100px;
  height: 150px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.color-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
  pointer-events: none;
}

.pin-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
  align-self: flex-end;
  z-index: 1;
}

.color-value {
  text-align: center;
  padding: 5px;
  background-color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  word-break: break-all;
}
</style>