<script setup>
import Counter from './components/Counter.vue'

const max = 10

function warn() {
  // NOTE: will affect callee's iframe, not this parent document.
  // TODO: does it make sense to be the latter?
  document.body.style.backgroundColor = 'yellow'
}
</script>

# VitePress

<iframe data-why>
  <p>Click to increment!</p>
  <Counter />
</iframe>

<iframe data-why data-why-template="basic">
  <p>Do not go over {{ max }}</p>
  <Counter :max="max" @max="warn" />
</iframe>
