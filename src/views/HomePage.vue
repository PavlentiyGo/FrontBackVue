<template>
  <div class="palette-generator">
    <h2>Генератор палитр</h2>

    <div class="controls">
      <!-- 3. Базовые инструменты настройки - изменённый блок выбора количества цветов -->
      <div class="control-group">
        <label>Количество цветов:</label>
        <div class="color-count-buttons">
          <button
            v-for="count in [3, 5, 7]"
            :key="count"
            @click="colorCount = count"
            class="count-btn"
            :class="{ active: colorCount === count }"
          >
            {{ count }}
          </button>
        </div>
      </div>

      <div class="control-group">
        <label>
          <input type="checkbox" v-model="showRGB"> Показать RGB
        </label>
      </div>
      <button @click="generatePalette" class="generate-btn">Случайная палитра</button>
    </div>

    <div class="palette-container" v-if="currentPalette.length > 0">
      <ColorCard
        v-for="(color, index) in currentPalette"
        :key="index"
        :color-data="color"
        :show-r-g-b="showRGB"
        @click="copyToClipboard"
        @toggle-pin="togglePin(index)"
      />
    </div>
    <div v-else class="empty-state">
      <p>Палитра пуста. Нажмите "Случайная палитра", чтобы создать одну.</p>
    </div>

    <!-- 4. Простой просмотрщик -->
    <div class="preview-section">
      <h3>Предпросмотр</h3>
      <div class="preview-controls">
        <button @click="togglePreviewBg" class="toggle-bg-btn">
          {{ previewDarkBg ? 'Светлый фон' : 'Тёмный фон' }}
        </button>
      </div>
      <!-- Контейнер предпросмотра с динамическим фоном -->
      <div class="preview-container" :class="{ dark: previewDarkBg }">
        <!-- Заголовок, использующий первый цвет -->

        <!-- Динамическое создание карточек для каждого цвета в палитре -->
        <div
          v-for="(color, index) in currentPalette"
          :key="`preview-card-${index}`"
          class="preview-card"
          :style="{ backgroundColor: color.hex, color: getContrastColor(color.hex) }"
        >
          <!-- Текст внутри карточки можно настроить по-разному -->
          <!-- Вариант 1: Просто текст с индексом и HEX -->
          <p>Карточка {{ index + 1 }} ({{ color.hex }})</p>
          <!-- Вариант 2: Показывать RGB, если включён соответствующий режим -->
          <!-- <p>Карточка {{ index + 1 }} ({{ showRGB ? color.rgb : color.hex }})</p> -->
        </div>

        <!-- Кнопка, использующая последний цвет из палитры -->
        <!-- Если палитра пуста, используется цвет по умолчанию -->
      </div>
    </div>

    <div v-if="copiedMessage" class="notification copied-notification">
      {{ copiedMessage }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import ColorCard from '../components/ColorCard.vue' // Импортируем компонент

export default {
  name: 'HomePage',
  components: { ColorCard }, // Регистрируем компонент
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
  // --- НОВАЯ ЛОГИКА: Сохранение позиции закреплённых цветов ---
  // Создаём новый массив нужного размера
  const newPalette = new Array(colorCount.value)

  // Проходим по старой палитре и копируем закреплённые цвета на их старые позиции в новом массиве
  for (let i = 0; i < currentPalette.length; i++) {
    const colorObj = currentPalette[i]
    // Проверяем, входит ли индекс в диапазон новой палитры и закреплён ли цвет
    if (i < colorCount.value && colorObj.pinned) {
      const rgb = hexToRgb(colorObj.hex) // Пересчитываем RGB для консистентности
      newPalette[i] = {
        hex: colorObj.hex,
        rgb: rgbToString(rgb),
        pinned: true,
        index: i
      }
    }
  }

  // Проходим по новому массиву и генерируем цвета для пустых (незакреплённых) позиций
  for (let i = 0; i < newPalette.length; i++) {
    if (!newPalette[i]) { // Если позиция пуста (не было закреплённого цвета)
      const hex = generateRandomHex()
      const rgb = hexToRgb(hex)
      newPalette[i] = {
        hex,
        rgb: rgbToString(rgb),
        pinned: false, // Новый цвет не закреплён
        index: i
      }
    }
  }

  // Заменяем содержимое реактивного массива на новый массив
  currentPalette.splice(0, currentPalette.length, ...newPalette)
  // --- КОНЕЦ НОВОЙ ЛОГИКИ ---

  savePaletteToStorage() // Сохраняем после генерации
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
          colorCount.value = parsed.colorCount || 5 // Убедимся, что значение 3, 5 или 7
          if (![3, 5, 7].includes(colorCount.value)) {
              colorCount.value = 5; // Установить значение по умолчанию, если оно некорректно
          }
          currentPalette.splice(0, currentPalette.length)
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
          // На случай ошибки, генерируем новую палитру
          generatePalette()
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
/* Стили остаются теми же, что и в предыдущем варианте PaletteGenerator.vue, с добавлением стилей для кнопок */
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

/* --- Новые стили для кнопок выбора количества цветов --- */
.color-count-buttons {
  display: flex;
  gap: 5px;
}

.count-btn {
  padding: 5px 10px;
  border: 1px solid #ccc;
  background-color: #f8f9fa;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.count-btn:hover {
  background-color: #e9ecef;
}

.count-btn.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}
/* --- Конец новых стилей --- */


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

/* Стиль для динамически создаваемых карточек в предпросмотре */
.preview-card {
  padding: 15px;
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid #ddd; /* Тонкая граница для контраста */
  color: white; /* Цвет текста по умолчанию */
  /* Цвет фона будет установлен через :style */
}

.preview-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 15px; /* Отступ сверху от последней карточки */
  /* Цвета фона и текста будут установлены через :style */
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