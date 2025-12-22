import { PrismaClient, Role, TemplateKind } from "@prisma/client";
import bcrypt from "bcryptjs";
import { defaultSystemPrompt, defaultUserPrompt } from "../lib/openai";

const prisma = new PrismaClient();

const questions = [
  { order: 1, key: "consent", title: "Acepto términos y privacidad", type: "singleChoice", options: [{ label: "Acepto", value: true }], validations: { required: true }, helpHtml: "<p>Necesitamos tu consentimiento para continuar.</p>" },
  { order: 2, key: "language", title: "Idioma", type: "singleChoice", options: [{ label: "Español", value: "es" }], description: "Preparamos i18n, por ahora solo ES." },
  { order: 3, key: "goal", title: "¿Qué buscas?", type: "singleChoice", options: [{ label: "Perder grasa", value: "perder_grasa" }, { label: "Ganar músculo", value: "ganar_musculo" }, { label: "Recomposición", value: "recomposicion" }] },
  { order: 4, key: "sex", title: "Sexo (opcional)", type: "singleChoice", isSkippable: true, options: [{ label: "Masculino", value: "masculino" }, { label: "Femenino", value: "femenino" }, { label: "Otro", value: "otro" }, { label: "Prefiero no decir", value: "prefiero_no_decir" }] },
  { order: 5, key: "age", title: "Edad", type: "singleChoice", options: [{ label: "18-24", value: 20 }, { label: "25-34", value: 30 }, { label: "35-44", value: 38 }, { label: "45+", value: 48 }] },
  { order: 6, key: "height", title: "Altura (cm)", type: "inputNumber", validations: { min: 120, max: 220 } },
  { order: 7, key: "weight", title: "Peso actual (kg)", type: "inputNumber", validations: { min: 35, max: 180 } },
  { order: 8, key: "targetWeight", title: "Peso objetivo (kg)", type: "inputNumber", validations: { min: 35, max: 180 } },
  { order: 9, key: "waist", title: "Medida cintura (opcional, cm)", type: "inputNumber", isSkippable: true, dependsOn: { key: "goal", in: ["perder_grasa", "recomposicion"] } },
  { order: 10, key: "fatLevel", title: "Nivel de grasa percibida", type: "slider", validations: { min: 1, max: 10 } },
  { order: 11, key: "bodyType", title: "Tipo de cuerpo", type: "singleChoice", options: [{ label: "Delgado", value: "delgado" }, { label: "Promedio", value: "promedio" }, { label: "Curvilíneo", value: "curvilineo" }] },
  { order: 12, key: "injuries", title: "Condición especial / lesiones", type: "multiChoice", options: [{ label: "Rodilla", value: "rodilla" }, { label: "Espalda", value: "espalda" }, { label: "Hombro", value: "hombro" }, { label: "Ninguna", value: "ninguna" }] },
  { order: 13, key: "medicalNotice", title: "Aviso médico", type: "singleChoice", options: [{ label: "Entiendo que esto no es consejo médico", value: true }], helpHtml: "<p>Consulta a profesionales sanitarios ante dudas.</p>" },
  { order: 14, key: "imcInfo", title: "IMC + explicación", type: "info", description: "Se calcula al final con tus datos.", footerHtml: "<small>Solo informativo.</small>", dependsOn: { and: [{ key: "height", gt: 100 }, { key: "weight", gt: 30 }] } },
  { order: 15, key: "sleep", title: "Horas de sueño promedio", type: "singleChoice", options: [{ label: "Menos de 6h", value: "<6" }, { label: "6-7h", value: "6-7" }, { label: "7-8h", value: "7-8" }, { label: "8h+", value: "8+" }] },
  { order: 16, key: "stress", title: "Estrés", type: "singleChoice", options: [{ label: "Bajo", value: "bajo" }, { label: "Medio", value: "medio" }, { label: "Alto", value: "alto" }] },
  { order: 17, key: "water", title: "Agua diaria", type: "singleChoice", options: [{ label: "Menos de 1L", value: "<1" }, { label: "1-2L", value: "1-2" }, { label: "2-3L", value: "2-3" }, { label: "3L+", value: "3+" }] },
  { order: 18, key: "steps", title: "Pasos/día", type: "singleChoice", options: [{ label: "Bajo", value: "bajo" }, { label: "Medio", value: "medio" }, { label: "Alto", value: "alto" }] },
  { order: 19, key: "workType", title: "Trabajo", type: "singleChoice", options: [{ label: "Sedentario", value: "sedentario" }, { label: "Mixto", value: "mixto" }, { label: "Activo", value: "activo" }] },
  { order: 20, key: "timeWeek", title: "Tiempo disponible entre semana", type: "singleChoice", options: [{ label: "10-15", value: "10-15" }, { label: "20-30", value: "20-30" }, { label: "30-45", value: "30-45" }] },
  { order: 21, key: "daysPerWeek", title: "Días por semana", type: "singleChoice", options: [{ label: "2", value: 2 }, { label: "3", value: 3 }, { label: "4", value: 4 }, { label: "5", value: 5 }] },
  { order: 22, key: "motivation", title: "Motivación principal", type: "singleChoice", options: [{ label: "Salud", value: "salud" }, { label: "Estética", value: "estetica" }, { label: "Energía", value: "energia" }, { label: "Evento", value: "evento" }] },
  { order: 23, key: "obstacle", title: "Obstáculo principal", type: "singleChoice", options: [{ label: "Tiempo", value: "tiempo" }, { label: "Motivación", value: "motivacion" }, { label: "Dolor", value: "dolor" }, { label: "Dieta", value: "dieta" }, { label: "Consistencia", value: "consistencia" }] },
  { order: 24, key: "motivationalMessage", title: "Mensaje motivacional", type: "info", description: "Pequeños cambios suman. Vamos paso a paso.", dependsOn: { key: "motivation", in: ["motivacion", "consistencia"] } },
  { order: 25, key: "place", title: "Lugar", type: "singleChoice", options: [{ label: "Casa", value: "casa" }, { label: "Gimnasio", value: "gimnasio" }] },
  { order: 26, key: "equipment", title: "Equipo", type: "multiChoice", options: [{ label: "Ninguno", value: "ninguno" }, { label: "Bandas", value: "bandas" }, { label: "Mancuernas", value: "mancuernas" }, { label: "Barra", value: "barra" }, { label: "Máquinas", value: "maquinas" }] },
  { order: 27, key: "level", title: "Nivel", type: "singleChoice", options: [{ label: "Principiante", value: "principiante" }, { label: "Intermedio", value: "intermedio" }, { label: "Avanzado", value: "avanzado" }] },
  { order: 28, key: "pushups", title: "Capacidad flexiones", type: "singleChoice", options: [{ label: "0-5", value: "0-5" }, { label: "6-10", value: "6-10" }, { label: "11-20", value: "11-20" }, { label: "20+", value: "20+" }] },
  { order: 29, key: "pullups", title: "Capacidad dominadas", type: "singleChoice", options: [{ label: "0", value: "0" }, { label: "1-3", value: "1-3" }, { label: "4-8", value: "4-8" }, { label: "8+", value: "8+" }] },
  { order: 30, key: "cardioPreference", title: "Preferencia Cardio", type: "singleChoice", options: [{ label: "Like", value: "like" }, { label: "Neutral", value: "neutral" }, { label: "Dislike", value: "dislike" }] },
  { order: 31, key: "strengthPreference", title: "Preferencia Fuerza", type: "singleChoice", options: [{ label: "Like", value: "like" }, { label: "Neutral", value: "neutral" }, { label: "Dislike", value: "dislike" }] },
  { order: 32, key: "mobilityPreference", title: "Preferencia Movilidad/Yoga", type: "singleChoice", options: [{ label: "Like", value: "like" }, { label: "Neutral", value: "neutral" }, { label: "Dislike", value: "dislike" }] },
  { order: 33, key: "secondaryGoal", title: "Objetivo secundario entreno", type: "singleChoice", options: [{ label: "Postura", value: "postura" }, { label: "Resistencia", value: "resistencia" }, { label: "Fuerza", value: "fuerza" }, { label: "Ninguno", value: "ninguno" }] },
  { order: 34, key: "dietType", title: "Tipo de dieta", type: "singleChoice", options: [{ label: "Omnívoro", value: "omnivoro" }, { label: "Vegetariano", value: "vegetariano" }, { label: "Vegano", value: "vegano" }, { label: "Pescetariano", value: "pescetariano" }] },
  { order: 35, key: "cookTime", title: "Tiempo para cocinar", type: "singleChoice", options: [{ label: "<30 min", value: "menos_30" }, { label: "30-60 min", value: "30_60" }, { label: "1h+", value: "1h" }, { label: "Prefiero pedir", value: "pedir" }], dependsOn: { key: "dietType", in: ["omnivoro", "vegetariano", "vegano", "pescetariano"] } },
  { order: 36, key: "sweets", title: "Dulces/azúcar", type: "singleChoice", options: [{ label: "Casi nunca", value: "nunca" }, { label: "1-2 semana", value: "1-2" }, { label: "Diario", value: "diario" }] },
  { order: 37, key: "drinks", title: "Bebidas", type: "multiChoice", options: [{ label: "Agua", value: "agua" }, { label: "Refrescos", value: "refrescos" }, { label: "Jugos", value: "jugos" }, { label: "Alcohol", value: "alcohol" }] },
  { order: 38, key: "mealsPerDay", title: "Comidas al día", type: "singleChoice", options: [{ label: "2", value: 2 }, { label: "3", value: 3 }, { label: "4", value: 4 }, { label: "Variable", value: "variable" }] },
  { order: 39, key: "restrictions", title: "Restricciones", type: "multiChoice", options: [{ label: "Sin gluten", value: "gluten" }, { label: "Sin lactosa", value: "lactosa" }, { label: "Ninguna", value: "ninguna" }, { label: "Otras", value: "otras" }] },
  { order: 40, key: "favorites", title: "Alimentos favoritos", type: "multiChoice", options: [{ label: "Proteínas magras", value: "proteinas" }, { label: "Verduras", value: "verduras" }, { label: "Fruta", value: "fruta" }, { label: "Legumbres", value: "legumbres" }] },
  { order: 41, key: "dislikes", title: "Alimentos que NO te gustan", type: "multiChoice", options: [{ label: "Pescado", value: "pescado" }, { label: "Lácteos", value: "lacteos" }, { label: "Picante", value: "picante" }, { label: "Ninguno", value: "ninguno" }] },
  { order: 42, key: "caloriePreference", title: "Objetivo calórico preferido", type: "singleChoice", options: [{ label: "Agresivo", value: "agresivo" }, { label: "Moderado", value: "moderado" }, { label: "Suave", value: "suave" }], helpHtml: "<ul><li>Agresivo: déficit notable</li><li>Moderado: balance</li><li>Suave: cambios graduales</li></ul>" },
  { order: 43, key: "supplements", title: "¿Quieres guía de suplementos?", type: "singleChoice", options: [{ label: "Sí", value: true }, { label: "No", value: false }] },
  { order: 44, key: "nutritionMessage", title: "Mensaje sobre consistencia nutricional", type: "info", description: "La adherencia es clave. Evita compararte, busca progresión." },
  { order: 45, key: "challenge", title: "Desafío opcional", type: "multiChoice", options: [{ label: "Caminar 10k", value: "caminar" }, { label: "Burpees", value: "burpees" }, { label: "Sin azúcar", value: "sin_azucar" }, { label: "Todos", value: "todos" }, { label: "Ninguno", value: "ninguno" }] },
  { order: 46, key: "commitment", title: "Compromiso", type: "singleChoice", options: [{ label: "Empiezo hoy", value: "hoy" }, { label: "Mañana", value: "manana" }, { label: "Esta semana", value: "semana" }, { label: "No estoy listo", value: "no_listo" }] },
  { order: 47, key: "name", title: "Nombre", type: "inputText" },
  { order: 48, key: "email", title: "Email + opt-in marketing", type: "inputEmail", footerHtml: "<p>El opt-in de marketing NO está preseleccionado.</p>" }
];

const workoutTemplates = [
  {
    kind: TemplateKind.WORKOUT,
    title: "Casa sin equipo - principiante",
    goal: "perder_grasa",
    level: "principiante",
    place: "casa",
    equipment: "ninguno",
    duration: "20-30",
    content: {
      focus: "full_body",
      blocks: ["calentamiento", "fuerza_basica", "cardio_suave"]
    }
  },
  {
    kind: TemplateKind.WORKOUT,
    title: "Casa con bandas - intermedio",
    goal: "recomposicion",
    level: "intermedio",
    place: "casa",
    equipment: "bandas",
    duration: "30",
    content: {
      focus: "superseries",
      days: 4
    }
  },
  {
    kind: TemplateKind.WORKOUT,
    title: "Gimnasio básico - avanzado",
    goal: "ganar_musculo",
    level: "avanzado",
    place: "gimnasio",
    equipment: "maquinas",
    duration: "45",
    content: {
      split: "empuje/tiron/pierna",
      rest: 90
    }
  }
];

const nutritionTemplates = [
  {
    kind: TemplateKind.NUTRITION,
    title: "Omnívoro 30min",
    dietType: "omnivoro",
    cookTime: "menos_30",
    content: { pattern: ["proteína magra", "carb complejo", "fibra"], kcal: "moderado" }
  },
  {
    kind: TemplateKind.NUTRITION,
    title: "Vegetariano 30min",
    dietType: "vegetariano",
    cookTime: "menos_30",
    content: { pattern: ["legumbres", "cereales integrales", "grasas buenas"], kcal: "moderado" }
  },
  {
    kind: TemplateKind.NUTRITION,
    title: "Vegano 30min",
    dietType: "vegano",
    cookTime: "menos_30",
    content: { pattern: ["tofu", "tempeh", "quinoa"], kcal: "moderado" }
  },
  {
    kind: TemplateKind.NUTRITION,
    title: "Prefiero pedir",
    dietType: "omnivoro",
    cookTime: "pedir",
    content: { pattern: ["elige opciones con proteína", "evita fritos"], kcal: "suave" }
  }
];

const pricingPlans = [
  { name: "Trial 1 semana", weeks: 1, priceTotal: 9, pricePerDay: 1.3, badge: "Prueba sin riesgo", trialDays: 7, popular: false },
  { name: "4 semanas", weeks: 4, priceTotal: 39, pricePerDay: 1.4, badge: "Ideal para arrancar", popular: true },
  { name: "12 semanas", weeks: 12, priceTotal: 89, pricePerDay: 1.05, badge: "Progreso sostenido", popular: false },
  { name: "24 semanas", weeks: 24, priceTotal: 159, pricePerDay: 0.95, badge: "Transformación total", popular: false }
];

const testimonials = [
  { name: "Ana V.", age: 32, quote: "El flujo me hizo pensar en mis hábitos y el plan fue claro.", metric: "-3kg en 4 semanas (mock)", avatar: "AV" },
  { name: "Luis M.", age: 29, quote: "Me encantó que todo pase por revisión humana antes de enviarlo.", metric: "Más energía (mock)", avatar: "LM" },
  { name: "Carla R.", age: 41, quote: "El onboarding fue rápido y sin trucos.", metric: "Pasos +2k/día (mock)", avatar: "CR" },
  { name: "Diego P.", age: 35, quote: "La vista diff entre IA y editor es súper útil.", metric: "Back pain-free (mock)", avatar: "DP" },
  { name: "Sara L.", age: 26, quote: "Buen equilibrio entre nutrición y entreno casero.", metric: "Habito agua +1L (mock)", avatar: "SL" },
  { name: "Jorge F.", age: 38, quote: "Sin dark patterns, opt-in claro.", metric: "Constancia semanal (mock)", avatar: "JF" },
  { name: "Natalia G.", age: 30, quote: "Me gustó el recordatorio ético en cada paso.", metric: "Sueño +30min (mock)", avatar: "NG" },
  { name: "Pedro Q.", age: 44, quote: "Panel admin ordenado y auditable.", metric: "Check-ins regulares (mock)", avatar: "PQ" }
];

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@fitnutricion.test" },
    update: {},
    create: { email: "admin@fitnutricion.test", passwordHash, role: Role.SUPERADMIN, name: "Admin Fit" }
  });

  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      useOpenAI: false,
      model: "gpt-4.1-mini",
      temperature: 0.4,
      maxTokens: 1500,
      promptSystem: defaultSystemPrompt,
      promptUser: defaultUserPrompt,
      rateLimitPerMin: 30,
      masterKeyHint: "Usa MASTER_KEY para cifrar API Keys"
    }
  });

  for (const q of questions) {
    await prisma.question.upsert({
      where: { key: q.key },
      update: { ...q },
      create: { ...q, title: q.title }
    });
  }

  for (const tpl of workoutTemplates.concat(nutritionTemplates)) {
    await prisma.template.create({ data: tpl });
  }

  for (const plan of pricingPlans) {
    await prisma.pricingPlan.create({ data: plan });
  }

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
