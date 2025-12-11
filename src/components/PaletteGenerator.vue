<template>
  <div class="palette-generator">
    <h2>Генератор палитр</h2>
    <div class="controls">
      <div class="control-group">
        <label for="color-count">Количество цветов:</label>
        <select id="color-count" v-model.number="colorCount" class="select-input">
          <option :value="3">3</option>
          <option :value="5">5</option>
          <option :value="7">7</option>
        </select>
      </div>
      <div class="control-group">
        <label>
          <input type="checkbox" v-model="showRGB"> Показать RGB
        </label>
      </div>
      <button @click="generatePalette" class="generate-btn">Случайная палитра</button>
    </div>
    <div class="palette-container" v-if="currentPalette.length > 0">
      <div
        v-for="(color, index) in currentPalette"
        :key="index"
        class="color-card"
        :style="{ backgroundColor: color.hex }"
        @click="copyToClipboard(color.hex)"
        :title="`Кликните, чтобы скопировать ${color.hex}`"
      >
        <button @click.stop="togglePin(index)" class="pin-btn" :class="{ pinned: color.pinned }">
          {{ color.pinned ? '📌' : '📍' }}
        </button>
        <div class="color-value">
          {{ showRGB ? color.rgb : color.hex }}
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <p>Палитра пуста. Нажмите "Случайная палитра", чтобы создать одну.</p>
    </div>
    <div class="preview-section">
      <h3>Предпросмотр</h3>
      <div class="preview-controls">
        <button @click="togglePreviewBg" class="toggle-bg-btn">
          {{ previewDarkBg ? 'Светлый фон' : 'Тёмный фон' }}
        </button>
      </div>
      <div class="preview-container" :class="{ dark: previewDarkBg }">
        <h4 :style="{ color: currentPalette[0]?.hex || '#000' }" class="preview-title">Заголовок</h4>
        <div class="preview-card" :style="{ backgroundColor: currentPalette[1]?.hex || '#f0f0f0', borderColor: currentPalette[2]?.hex || '#ccc' }">
          <p :style="{ color: currentPalette[3]?.hex || '#333' }">Это пример карточки с контентом.</p>
        </div>
        <button :style="{ backgroundColor: currentPalette[4]?.hex || '#007bff', color: getContrastColor(currentPalette[4]?.hex || '#000') }" class="preview-btn">
          Пример кнопки
        </button>
      </div>
    </div>
    <div v-if="copiedMessage" class="notification copied-notification">
      {{ copiedMessage }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'

export default {
  name: 'PaletteGenerator',
  setup() {
    const colorCount = ref(5) 
    const showRGB = ref(false) 
    const previewDarkBg = ref(false) 
    const copiedMessage = ref('')
    let hideCopiedTimeout = null 

  
    const currentPalette = reactive([])
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    }

    const rgbToString = (rgb) => {
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    }

    const getContrastColor = (bgColor) => {
      const rgb = hexToRgb(bgColor)
      if (!rgb) return '#000000'
      const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
      return brightness > 128 ? '#000000' : '#FFFFFF'
    }

    const generateRandomHex = () => {
      return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
    }

    const generatePalette = () => {
      currentPalette.splice(0, currentPalette.length)
      for (let i = 0; i < colorCount.value; i++) {
        const existingPinned = currentPalette.find(c => c.pinned && c.index === i)
        if (existingPinned) {
          currentPalette.push({ ...existingPinned.color, index: i })
        } else {
          const hex = generateRandomHex()
          const rgb = hexToRgb(hex)
          currentPalette.push({
            hex,
            rgb: rgbToString(rgb),
            pinned: false,
            index: i
          })
        }
      }
      savePaletteToStorage()
    }

    const copyToClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        copiedMessage.value = `Скопировано: ${text}`
        if (hideCopiedTimeout) clearTimeout(hideCopiedTimeout)
        hideCopiedTimeout = setTimeout(() => {
          copiedMessage.value = ''
        }, 2000)
      } catch (err) {
        console.error('Не удалось скопировать текст: ', err)
      }
    }

    const togglePin = (index) => {
      const colorObj = currentPalette[index]
      if (colorObj) {
        colorObj.pinned = !colorObj.pinned 
        savePaletteToStorage() 
      }
    }

    const togglePreviewBg = () => {
      previewDarkBg.value = !previewDarkBg.value
    }
    const savePaletteToStorage = () => {
      const paletteData = {
        colors: currentPalette.map(c => ({ hex: c.hex, pinned: c.pinned })),
        colorCount: colorCount.value
      }
      localStorage.setItem('savedPalette', JSON.stringify(paletteData))
    }

    const loadPaletteFromStorage = () => {
      const saved = localStorage.getItem('savedPalette')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          colorCount.value = parsed.colorCount || 5
          currentPalette.splice(0, currentPalette.length) // Очищаем
          parsed.colors.forEach((savedColor, i) => {
            const rgb = hexToRgb(savedColor.hex)
            currentPalette.push({
              hex: savedColor.hex,
              rgb: rgbToString(rgb),
              pinned: savedColor.pinned,
              index: i
            })
          })
        } catch (e) {
          console.error("Ошибка при загрузке палитры из localStorage:", e)
        }
      } else {
        generatePalette()
      }
    }
    onMounted(() => {
      loadPaletteFromStorage()
    })
    return {
      colorCount,
      showRGB,
      previewDarkBg,
      copiedMessage,
      currentPalette,
      generatePalette,
      copyToClipboard,
      togglePin,
      togglePreviewBg,
      getContrastColor
    }
  }
}
</script>

<style scoped>
.palette-generator {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  align-items: end; 
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.select-input, .generate-btn, .toggle-bg-btn {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.generate-btn, .toggle-bg-btn {
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  align-self: flex-end;
}

.generate-btn:hover, .toggle-bg-btn:hover {
  background-color: #0056b3;
}

.palette-container {
  display: flex;
  justify-content: center; 
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap; 
}

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

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

.preview-section {
  margin-top: 30px;
}

.preview-controls {
  text-align: center;
  margin-bottom: 15px;
}

.toggle-bg-btn {
  font-size: 14px;
}

.preview-container {
  padding: 20px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.preview-container.dark {
  background-color: #222;
  color: #fff;
}

.preview-title {
  margin-bottom: 15px;
}

.preview-card {
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 15px;
}

.preview-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  z-index: 1000;
}

.copied-notification {
  background-color: #28a745; 
}
</style>