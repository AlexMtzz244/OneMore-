/**
 * seed.cjs — Popula Firestore con productos reales del catálogo OneMore.
 * Uso: node seed.cjs
 * Requiere: servidor Next.js puede estar apagado, solo necesita .env.local
 */
const { initializeApp, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp } = require('firebase-admin/firestore')
const fs = require('fs')

// ── Leer credenciales ──────────────────────────────────────────────────────────
const raw = fs.readFileSync('.env.local', 'utf8')
const get = (k) => {
  const m = raw.match(new RegExp(`^${k}=(.+)$`, 'm'))
  return m ? m[1].replace(/^"|"$/g, '') : ''
}

initializeApp({
  credential: cert({
    projectId: get('FIREBASE_ADMIN_PROJECT_ID'),
    clientEmail: get('FIREBASE_ADMIN_CLIENT_EMAIL'),
    privateKey: get('FIREBASE_ADMIN_PRIVATE_KEY').replace(/\\n/g, '\n'),
  }),
})

const db = getFirestore()

// ── Catálogo de productos ──────────────────────────────────────────────────────
const products = [
  {
    name: 'Whey Protein Isolate',
    brand: 'ProMax',
    category: 'proteina',
    price: 1299,
    description: 'Proteína aislada de suero de alta pureza con 90% de contenido proteico. Ideal para recuperación muscular post-entrenamiento.',
    nutritionalInfo: {
      servingSize: '30g',
      servingsPerContainer: 33,
      protein: '27g',
      carbs: '1g',
      fats: '0.5g',
      calories: '110 kcal',
      otherIngredients: ['BCAA', 'Glutamina'],
    },
    presentation: '1kg',
    stock: 50,
    images: ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800'],
    goal: ['volumen', 'definicion'],
    featured: true,
    bestSeller: true,
    rating: 4.8,
    reviewCount: 156,
  },
  {
    name: 'Creatina Monohidratada',
    brand: 'PowerLift',
    category: 'creatina',
    price: 649,
    description: 'Creatina monohidratada micronizada de alta pureza. Aumenta la fuerza y el rendimiento en entrenamientos de alta intensidad.',
    nutritionalInfo: {
      servingSize: '5g',
      servingsPerContainer: 60,
      protein: '0g',
      carbs: '0g',
      fats: '0g',
      calories: '0 kcal',
      otherIngredients: ['Creatina Monohidrato 100%'],
    },
    presentation: '300g',
    stock: 75,
    images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800'],
    goal: ['fuerza', 'volumen'],
    featured: true,
    bestSeller: true,
    discount: 15,
    rating: 4.9,
    reviewCount: 203,
  },
  {
    name: 'Pre-Workout Extreme',
    brand: 'EnergyMax',
    category: 'pre-workout',
    price: 799,
    description: 'Fórmula pre-entreno con cafeína, beta-alanina y citrulina para máxima energía y concentración.',
    nutritionalInfo: {
      servingSize: '15g',
      servingsPerContainer: 20,
      protein: '0g',
      carbs: '3g',
      fats: '0g',
      calories: '15 kcal',
      otherIngredients: ['Cafeína 200mg', 'Beta-Alanina', 'Citrulina', 'Taurina'],
    },
    presentation: '300g',
    stock: 40,
    images: ['https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800'],
    goal: ['fuerza', 'resistencia'],
    featured: true,
    bestSeller: false,
    rating: 4.6,
    reviewCount: 89,
  },
  {
    name: 'Shaker Premium',
    brand: 'FitGear',
    category: 'accesorios',
    price: 189,
    description: 'Shaker libre de BPA con compartimento para suplementos y bola mezcladora incluida. Capacidad 700ml.',
    nutritionalInfo: {
      servingSize: 'N/A',
      servingsPerContainer: 0,
      otherIngredients: [],
    },
    presentation: 'Unidad',
    stock: 100,
    images: ['https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800'],
    goal: ['general'],
    featured: false,
    bestSeller: true,
    rating: 4.7,
    reviewCount: 124,
  },
  {
    name: 'Caseína Nocturna',
    brand: 'ProMax',
    category: 'proteina',
    price: 1399,
    description: 'Proteína de absorción lenta ideal para tomar antes de dormir. Libera aminoácidos durante toda la noche.',
    nutritionalInfo: {
      servingSize: '35g',
      servingsPerContainer: 28,
      protein: '24g',
      carbs: '3g',
      fats: '1g',
      calories: '120 kcal',
      otherIngredients: ['Caseína Micelar', 'Enzimas Digestivas'],
    },
    presentation: '1kg',
    stock: 3,
    images: ['https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800'],
    goal: ['volumen', 'definicion'],
    featured: false,
    bestSeller: false,
    rating: 4.5,
    reviewCount: 67,
  },
  {
    name: 'BCAA Recovery',
    brand: 'PowerLift',
    category: 'pre-workout',
    price: 699,
    description: 'Aminoácidos ramificados en ratio 2:1:1 para recuperación muscular y prevención del catabolismo.',
    nutritionalInfo: {
      servingSize: '10g',
      servingsPerContainer: 30,
      protein: '0g',
      carbs: '0g',
      fats: '0g',
      calories: '0 kcal',
      otherIngredients: ['Leucina', 'Isoleucina', 'Valina', 'Vitamina B6'],
    },
    presentation: '300g',
    stock: 60,
    images: ['https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800'],
    goal: ['volumen', 'definicion', 'resistencia'],
    featured: true,
    bestSeller: false,
    rating: 4.4,
    reviewCount: 98,
  },
  {
    name: 'Glutamina Ultra',
    brand: 'EnergyMax',
    category: 'proteina',
    price: 549,
    description: 'L-Glutamina pura para recuperación muscular y soporte del sistema inmunológico.',
    nutritionalInfo: {
      servingSize: '5g',
      servingsPerContainer: 60,
      protein: '0g',
      carbs: '0g',
      fats: '0g',
      calories: '0 kcal',
      otherIngredients: ['L-Glutamina 100%'],
    },
    presentation: '300g',
    stock: 2,
    images: ['https://images.unsplash.com/photo-1610893687381-c488352f9a95?w=800'],
    goal: ['volumen', 'resistencia'],
    featured: false,
    bestSeller: false,
    rating: 4.3,
    reviewCount: 45,
  },
  {
    name: 'Guantes de Entrenamiento',
    brand: 'FitGear',
    category: 'accesorios',
    price: 329,
    description: 'Guantes acolchados con soporte de muñeca para levantamiento de pesas. Material transpirable.',
    nutritionalInfo: {
      servingSize: 'N/A',
      servingsPerContainer: 0,
      otherIngredients: [],
    },
    presentation: 'Par',
    stock: 80,
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800'],
    goal: ['general'],
    featured: false,
    bestSeller: true,
    rating: 4.6,
    reviewCount: 112,
  },
  {
    name: 'Creatina HCL',
    brand: 'PowerLift',
    category: 'creatina',
    price: 759,
    description: 'Creatina HCL de alta biodisponibilidad. No requiere fase de carga y mejor absorción.',
    nutritionalInfo: {
      servingSize: '2g',
      servingsPerContainer: 75,
      protein: '0g',
      carbs: '0g',
      fats: '0g',
      calories: '0 kcal',
      otherIngredients: ['Creatina HCL 100%'],
    },
    presentation: '150g',
    stock: 55,
    images: ['https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800'],
    goal: ['fuerza', 'volumen'],
    featured: false,
    bestSeller: false,
    rating: 4.7,
    reviewCount: 76,
  },
  {
    name: 'Pre-Workout Natural',
    brand: 'EnergyMax',
    category: 'pre-workout',
    price: 629,
    description: 'Pre-entreno con ingredientes naturales, sin estimulantes artificiales. Con cafeína de té verde.',
    nutritionalInfo: {
      servingSize: '12g',
      servingsPerContainer: 25,
      protein: '0g',
      carbs: '2g',
      fats: '0g',
      calories: '10 kcal',
      otherIngredients: ['Cafeína Natural 100mg', 'Extracto de Remolacha', 'L-Arginina'],
    },
    presentation: '300g',
    stock: 35,
    images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800'],
    goal: ['resistencia', 'general'],
    featured: false,
    bestSeller: false,
    discount: 10,
    rating: 4.4,
    reviewCount: 54,
  },
  {
    name: 'Proteína Vegana',
    brand: 'ProMax',
    category: 'proteina',
    price: 1199,
    description: 'Proteína vegetal de guisante y arroz. 100% plant-based con perfil completo de aminoácidos.',
    nutritionalInfo: {
      servingSize: '30g',
      servingsPerContainer: 33,
      protein: '22g',
      carbs: '3g',
      fats: '2g',
      calories: '120 kcal',
      otherIngredients: ['Proteína de Guisante', 'Proteína de Arroz', 'Enzimas Digestivas'],
    },
    presentation: '1kg',
    stock: 40,
    images: ['https://images.unsplash.com/photo-1594882645126-14020914d58d?w=800'],
    goal: ['volumen', 'definicion'],
    featured: true,
    bestSeller: false,
    rating: 4.5,
    reviewCount: 89,
  },
  {
    name: 'Cinturón de Levantamiento',
    brand: 'FitGear',
    category: 'accesorios',
    price: 999,
    description: 'Cinturón de cuero genuino para soporte lumbar en levantamientos pesados. Hebilla de doble cierre.',
    nutritionalInfo: {
      servingSize: 'N/A',
      servingsPerContainer: 0,
      otherIngredients: [],
    },
    presentation: 'Unidad',
    stock: 25,
    images: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800'],
    goal: ['fuerza'],
    featured: false,
    bestSeller: false,
    rating: 4.8,
    reviewCount: 67,
  },
]

// ── Ejecutar seed ─────────────────────────────────────────────────────────────
async function seed() {
  const col = db.collection('products')

  // Verificar si ya hay productos para no duplicar
  const existing = await col.limit(1).get()
  if (!existing.empty) {
    console.log('⚠️  La colección "products" ya tiene datos.')
    console.log('   Para re-sembrar, borra la colección en Firebase Console primero.')
    console.log('   → https://console.firebase.google.com/project/onemore-843b8/firestore')
    return
  }

  console.log(`Insertando ${products.length} productos en Firestore...`)

  // Batch write para mayor eficiencia (máx 500 por batch)
  const batch = db.batch()
  for (const p of products) {
    const ref = col.doc()
    batch.set(ref, { ...p, createdAt: Timestamp.now() })
  }
  await batch.commit()

  console.log(`✅ ${products.length} productos insertados correctamente.`)
  console.log('\n📦 Productos en la BD:')
  products.forEach((p, i) => {
    console.log(`  ${String(i + 1).padStart(2, '0')}. [${p.category.padEnd(12)}] ${p.name} — $${p.price}`)
  })
  console.log('\n🌐 Abre http://localhost:5173 para verlos en el e-commerce.')
}

seed().catch((e) => {
  console.error('❌ Error en seed:', e.message)
  process.exit(1)
})
