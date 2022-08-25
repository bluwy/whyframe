<script setup>
import Counter from './components/Counter.vue'
import Story from './components/Story.vue'

const max = 10

function warn() {
  // NOTE: will affect callee's iframe, not this parent document
  console.log('warn!')
}
</script>

# VitePress

<iframe data-why>
  <p>Click to increment!</p>
  <Counter />
</iframe>

<iframe data-why src="/frames/basic">
  <p>Do not go over {{ max }}</p>
  <Counter :max="max" @max="warn" />
</iframe>

<Story title="Foo">
  <p>Click to increment!</p>
  <Counter />
</Story>

<Story title="Bar" src="/frames/basic">
  <p>Do not go over {{ max }}</p>
  <Counter :max="max" @max="warn" />
</Story>
