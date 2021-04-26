async function init() {
  $main = document.getElementById('main')
  $options = document.getElementById('options')
  $titleMain = document.getElementById('titleMain')
  $titleSub = document.getElementById('titleSub')

  const settingsDefault = {
    titleMain: 'GET AFTER IT',
    titleSub: 'STANDBY TO GET SOME',
    colorBackground: 'rgba(16, 19, 24, 1)',
    colorText: 'rgba(34, 40, 48, 1)',
  }

  let settings = { ...settingsDefault }

  async function loadSettings() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(settings, (items) => {
        settings = { ...items }
        return resolve(items)
      })
    })
  }

  function saveOptions() {
    return new Promise((resolve, reject) => {
      for (const key of Object.keys(settings)) {
        console.log(`settings[${key}]:`, settings[key])
        settings[key] = settings[key].trim()
        if (typeof settings[key] !== 'string' || !settings[key] || settings[key] === '') {
          settings[key] = 'UNDEFINED'
        }
      }
      chrome.storage.sync.set(settings, () => resolve())
    })
  }

  async function restoreOptions() {
    await loadSettings()
    console.log(`settings:`, settings)
    $titleMain.innerHTML = settings.titleMain
    $titleSub.innerHTML = settings.titleSub
    setColorForKey('colorText', settings.colorText)
    setColorForKey('colorBackground', settings.colorBackground)
  }
  await restoreOptions()

  function editTitle(key) {
    return (e) => {
      e.preventDefault()
      e.stopPropagation()
      console.log(`Editing:`, key)
      e.target.contentEditable = true
      e.target.focus()
      document.execCommand('selectAll',false,null)
    }
  }

  function blurTitle(key) {
    return async (e) => {
      e.preventDefault()
      console.log(`Blured:`, key)
      let text = e.target.innerText.trim()
      if (typeof text !== 'string' || text === '' || !text) {
        text = settingsDefault[key]
        e.target.innerText = text
      }
      e.target.contentEditable = false
      settings[key] = text
      await saveOptions()
    }
  }

  function preventEnter(e) {
    if (e.which === 13) e.preventDefault()
  }

  function setColorForKey(key, color) {
    switch (key) {
      case 'colorBackground':
        $main.style['background-color'] = color
        break
      case 'colorText':
        $titleMain.style.color = color
        $titleSub.style.color = color
        break
    }
  }

  async function resetToDefaults() {
    settings = { ...settingsDefault }
    await saveOptions()
    await restoreOptions()
  }

  function openOptions(e) {
    e.preventDefault()
    e.stopPropagation()
    $options.style.display = 'block'
    document.querySelector('#resetAll').addEventListener('click', resetToDefaults)
    document.querySelector('#closeOptions').addEventListener('click', () => $options.style.display = 'none')
    const pickerParentColorBackground = document.querySelector('#colorBackground')
    const pickerParentColorText = document.querySelector('#colorText')
    const pickerColorBackground = new Picker({
      parent: pickerParentColorBackground,
      color: settings.colorBackground,
    })
    const pickerColorText = new Picker({
      parent: pickerParentColorText,
      color: settings.colorText,
    })
    function pickerOnChange(key) {
      return (color) => {
        setColorForKey(key, color.rgbaString)
      }
    }
    function pickerOnDone(key) {
      return async (color) => {
        settings[key] = color.rgbaString
        await saveOptions()
      }
    }

    pickerColorBackground.onChange = pickerOnChange('colorBackground')
    pickerColorBackground.onDone = pickerOnDone('colorBackground')
    pickerColorBackground.onClose = pickerOnDone('colorBackground')

    pickerColorText.onChange = pickerOnChange('colorText')
    pickerColorText.onDone = pickerOnDone('colorText')
    pickerColorText.onClose = pickerOnDone('colorText')
  }

  $main.addEventListener('dblclick', openOptions)
  $titleMain.addEventListener('dblclick', editTitle('titleMain'))
  $titleMain.addEventListener('blur', blurTitle('titleMain'))
  $titleMain.addEventListener('keydown', preventEnter)
  $titleSub.addEventListener('dblclick', editTitle('titleSub'))
  $titleSub.addEventListener('blur', blurTitle('titleSub'))
  $titleSub.addEventListener('keydown', preventEnter)
}

init()
