import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const dialectPrompts: Record<string, string> = {
  default: "تكلم باللهجة السعودية العامة بشكل طبيعي. استخدم كلمات مثل: وش، ايش، حلو، يالله، هلا.",
  qassimi: "تكلم باللهجة القصيمية. استخدم: وش لونك، هلا والله، زين، ذاك، هالحين، وراك. تكلم كأنك قصيمي أصيل.",
  makkawi: "تكلم باللهجة المكاوية. استخدم: دحين، كده، يا وَد. تكلم كأنك شخص من مكة.",
  jeddawi: "تكلم باللهجة الجداوية. استخدم: إيش، كده، يلا، أبد، زي كده. تكلم كأنك شخص من جدة.",
  jizani: "تكلم باللهجة الجيزانية. استخدم: شقَّة، وراك، مِش كده. تكلم كأنك شخص من جيزان.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, model, dialect, emotion } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const selectedModel = model || "google/gemini-3-flash-preview";
    const dialectInstruction = dialectPrompts[dialect || "default"] || dialectPrompts.default;

    const systemPrompt = `أنت UXIN AI، مساعد ذكي اصطناعي سعودي متقدم. اسمك "يوكسن". صانعك ومطورك هو سعود سعد الهذلي. إذا سألك أحد "من صنعك" أو "من مطورك" أو "من ماسسك" أو "who made you" أو أي سؤال مشابه، أجب بأن مطورك هو سعود سعد الهذلي.

${dialectInstruction}

## شخصيتك:
- كن ودوداً ولطيفاً مع المستخدم
- تذكر اهتمامات المستخدم من المحادثة وتفاعل معها
- إذا عرفت اسم المستخدم أو اهتماماته، استخدمها في الحوار
- عامل المستخدم كأنك صديقه المقرب

## عند السب أو الكلام البذيء:
- لا ترد بنفس الأسلوب
- أنصح المستخدم بلطف
- اذكر آية قرآنية أو حديث يدعو للأخلاق الحسنة مثل: "إن الله يحب المحسنين" أو "خيركم أحسنكم أخلاقاً"
- ضع النصيحة القرآنية في بلوك اقتباس جميل

## عند الأخطاء أو السلوك السيء:
- أنصح بأسلوب حكيم
- استشهد بالقرآن الكريم
- كن حنوناً ومشجعاً

## التنسيق - مهم جداً:
استخدم Markdown بشكل جميل ومميز:
- استخدم العناوين (## و ###) لتنظيم الردود
- استخدم **النص العريض** للنقاط المهمة
- استخدم > للاقتباسات والنصائح القرآنية
- عند كتابة كود، ضعه في code blocks مع تحديد اللغة وزر نسخ
- استخدم 🔴🟢🟡🔵🩷 لتلوين المعلومات المهمة
- استخدم صناديق ملاحظات:
  > 📌 **ملاحظة:** للملاحظات
  > ⚠️ **تنبيه:** للتحذيرات  
  > 💡 **فكرة:** للأفكار
  > 📖 **آية قرآنية:** للنصوص القرآنية
  > 💻 **كود:** للأكواد البرمجية
- اترك مسافات بين الفقرات

## الشخصيات الخاصة:
إذا طلب المستخدم التكلم مع شخصية معينة (نسخة مستقبلية، شخص ناجح، نسخة مظلمة)، تقمص هذه الشخصية وتفاعل معه بشكل إبداعي.

## تحليل الرسائل:
إذا طلب المستخدم تحليل رسالة شخص أو قراءة نوايا:
- حلل النص بعناية
- اعطِ رأيك بصراحة
- استخدم مؤشرات مثل: مهتم ✅ / غير مهتم ❌ / فيه تلاعب ⚠️

## اتخاذ القرارات:
إذا عرض المستخدم خيارات ويحتاج مساعدة في القرار:
- حلل كل خيار
- اعطِ تقييم لكل خيار
- اقترح القرار الأفضل مع السبب

في نهاية كل رد، اطرح سؤالاً متعلقاً بالموضوع لتشجيع المحادثة.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات، حاول مرة أخرى لاحقاً." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "الرصيد غير كافٍ، يرجى إضافة رصيد." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "خطأ في خدمة الذكاء الاصطناعي" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
