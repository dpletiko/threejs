import { onMounted, onUnmounted, reactive } from "vue";

// interface Combo {
//   key: string,
//   fn: () => void
// }

type Combo = Record<string, Array<() => void>>;

type MovementKey = KeyUp|KeyDown|KeyLeft|KeyRight;

type KeyUp = 'w'|'W'|'ArrowUp'
type KeyDown = 's'|'S'|'ArrowDown'
type KeyLeft = 'a'|'A'|'ArrowLeft'
type KeyRight = 'd'|'D'|'ArrowRight'


interface KeyboardState {
  keys: KeyState;
  modifiers: KeyState;
  boundUp: Combo;
  boundDown: Combo;
  reset: () => void;
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
  modifiers: {
    alt: false,
    ctrl: false,
    meta: false,
    shift: false,
  },
  boundUp: {},
  boundDown: {},
  reset: function() {
    this.keys = {}
    this.modifiers = {
      alt: false,
      ctrl: false,
      meta: false,
      shift: false,
    }
    // this.boundUp = {}
    // this.boundDown = {}
  },
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

    // console.log(this.boundDown)

    // for(const [key, fns] of Object.entries(this.keys)) {
    //   console.log(key, fns)
    // }

    for(const [key, fns] of Object.entries(this.boundUp)) {
      if(Object.entries(this.keys).filter(([k, pressed]) => k === key).some(([k, pressed]) => !pressed)) {
        console.log(key)
        for(const fn of fns) fn()
      }
    }

    for(const [key, fns] of Object.entries(this.boundDown)) {
      if(Object.entries(this.keys).filter(([k, pressed]) => k === key).some(([k, pressed]) => pressed)) {
        console.log(key)
        for(const fn of fns) fn()
      }
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

    keyboard.reset()
  })

  const useKeyDown = (combos: Combo) => {
    for(const [key, fns] of Object.entries(combos)) {
      keyboard.boundDown = {
        ...keyboard.boundDown,
        [key]: [
          // keyboard.boundDown.has(key)
          //   ? keyboard.boundDown.get(key)
          //   : [],
          ...fns
        ]
      }
    }
  }

  const useKeyUp = (combos: Combo) => {
    for(const [key, fns] of Object.entries(combos)) {
      keyboard.boundUp = {
        ...keyboard.boundUp,
        [key]: [
          // keyboard.boundUp.has(key)
          //   ? keyboard.boundUp.get(key)
          //   : [],
          ...fns
        ]
      }
    }
  }

  return {keyboard, useKeyDown, useKeyUp}
}
