import { onMounted, onUnmounted, reactive } from "vue";

interface Combo {
  key: string,
  fn: () => void
}

type MovementKey = KeyUp|KeyDown|KeyLeft|KeyRight;

type KeyUp = 'w'|'W'|'ArrowUp'
type KeyDown = 's'|'S'|'ArrowDown'
type KeyLeft = 'a'|'A'|'ArrowLeft'
type KeyRight = 'd'|'D'|'ArrowRight'


interface KeyboardState {
  keys: KeyState;
  modifiers: KeyState;
  boundUp: Combo[];
  boundDown: Combo[];
  update: () => void;
  query: (key: string) => boolean
}

interface KeyState {
  [key: string]: boolean
}

const MODIFIERS	= ['shift', 'ctrl', 'alt', 'meta'];
const ALIAS: Record<string, string> = {

}

const keyboard = reactive<KeyboardState>({
  keys: {},
  modifiers: {},
  boundUp: [],
  boundDown: [],
  query: function(key: string) {
    for(const code of key.toLowerCase().split('+')) {
      let pressed: boolean = false;

      if(MODIFIERS.includes(code)) {
        pressed = this.modifiers[code]
      } else if (Object.keys(ALIAS).includes(code)) {
        pressed = this.keys[ALIAS[code]]
      } else {
        pressed = this.keys[code]
      }

      if(!pressed) return false
    }

    return true
  },
  update: function() {
    // console.log(this.keys)
    
    // for(const [k, pressed] of Object.entries(this.keys)) {
    //   if(!pressed) continue;
    //   Object.entries(this.boundDown)
    //     .filter(([_, {key, fn}]) => k == key)
    //     .map(([_, c]) => c.fn())
    // }

    for(const [_, combo] of Object.entries(this.boundUp)) {
      if(Object.entries(this.keys)
        .filter(([key, pressed]) => key === combo.key)
        .some(([key, pressed]) => !pressed)) combo.fn()
    }

    for(const [_, combo] of Object.entries(this.boundDown)) {
      if(Object.entries(this.keys)
        .filter(([key, pressed]) => key === combo.key)
        .some(([key, pressed]) => pressed)) combo.fn()
    }
  },
})

export default function useKeyboard() {
  const _onKeyChange = (e: KeyboardEvent, pressed: boolean) => {
    var keyCode		= e.key.toLowerCase();
    keyboard.keys = {...keyboard.keys, [keyCode]: pressed}

    // console.log(keyboard.keys)
    // console.log(keyboard.boundDown)
    
    keyboard.modifiers = {
      ...keyboard.modifiers,
      alt: e.altKey,
      ctrl: e.ctrlKey,
      meta: e.metaKey,
      shift: e.shiftKey,
    }
  }

  const _onKeyUp = (e: KeyboardEvent) => _onKeyChange(e, false)
  const _onKeyDown = (e: KeyboardEvent) => _onKeyChange(e, true)
  onMounted(() => {
    document.addEventListener("keyup", _onKeyUp, false);
    document.addEventListener("keydown", _onKeyDown, false);
  })
  onUnmounted(() => {
    document.removeEventListener("keyup", _onKeyUp, false);
    document.removeEventListener("keydown", _onKeyDown, false);
  })

  const useKeyDown = (combos: Combo[]) => {
    for(const combo of combos) {
      keyboard.boundDown = [...keyboard.boundDown, {key: combo.key.toLowerCase(), fn: () => combo.fn()}]
    }
  }

  const useKeyUp = (combos: Combo[]) => {
    for(const combo of combos) {
      keyboard.boundUp = [...keyboard.boundUp, {key: combo.key.toLowerCase(), fn: () => combo.fn()}]
    }
  }

  return {keyboard, useKeyDown, useKeyUp}
}
