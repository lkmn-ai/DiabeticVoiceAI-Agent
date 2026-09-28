"""One-off builder for ortho_kb.json — run: python data/_build_ortho_kb.py"""
import json
from pathlib import Path

entries = []


def add(qid, question, answer, category, subcategory):
    entries.append({
        "id": qid,
        "question": question,
        "answer": answer,
        "category": category,
        "subcategory": subcategory,
        "source": "ortho_kb",
    })


# --- injuries / first aid ---
add("or_001", "What is RICE for a sprained ankle?",
    "RICE means Rest, Ice, Compression, and Elevation. It is a common first-aid approach in the first 48 to 72 hours after many mild sprains. Rest means avoiding painful loading. Ice is usually applied in short sessions with a cloth barrier. Compression with an elastic wrap can limit swelling if it is not too tight. Elevation means keeping the ankle above heart level when possible. This is general first aid, not a diagnosis. Seek urgent care for deformity, inability to bear weight, numbness, or a popping sensation with severe swelling.",
    "injuries", "ankle_sprain")
add("or_002", "What should I do immediately after twisting my ankle?",
    "Stop the activity, get off the injured ankle, and use rest, ice, compression, and elevation if the injury looks mild. Do not try to walk it off if you cannot take four steps or if the ankle looks deformed. A fracture can mimic a sprain. Urgent evaluation is appropriate if you cannot bear weight, have numbness, or the joint looks out of place.",
    "injuries", "ankle_sprain")
add("or_003", "How long does a typical ankle sprain take to heal?",
    "Mild grade-1 sprains often improve over one to three weeks. Moderate sprains may take three to six weeks. Severe sprains involving complete ligament disruption can take several months and sometimes need specialist care. Healing time varies with age, prior sprains, and how soon protected movement begins. Persistent instability or repeated giving-way should be assessed by a clinician.",
    "injuries", "ankle_sprain")
add("or_004", "When should I use ice versus heat for a joint injury?",
    "Ice is often used in the first 48 to 72 hours after an acute sprain or strain to help comfort and swelling, in short sessions with a cloth barrier. Heat is more often used later for stiffness, muscle tightness, or chronic aching, not on a hot, swollen, freshly injured joint. Never apply ice or heat directly to skin, and avoid both if you have poor sensation, open wounds, or vascular disease unless a clinician advises otherwise.",
    "general", "ice_heat")
add("or_005", "What is a muscle strain?",
    "A muscle strain is an overstretch or tear of muscle fibers, often from sudden load or fatigue. Mild strains cause local soreness. More severe strains can cause swelling, bruising, and weakness. Initial care often includes relative rest, ice, and gradual return to movement. Complete tears or a visible muscle gap need prompt medical assessment.",
    "injuries", "strain")
add("or_006", "What is the difference between a sprain and a strain?",
    "A sprain injures ligaments that connect bone to bone. A strain injures muscle or tendon. Both can cause pain, swelling, and limited motion. Sprains are common in ankles and knees. Strains are common in the hamstring, calf, and lower back. Imaging and examination by a clinician are needed if you cannot use the limb or if symptoms are severe.",
    "injuries", "sprain_vs_strain")
add("or_007", "What are Ottawa ankle rules in simple terms?",
    "The Ottawa ankle rules are a clinical checklist used by trained professionals to decide whether an ankle X-ray is likely needed after injury. In plain terms, imaging is more often considered if you cannot take four steps or if there is bone tenderness at specific ankle or midfoot points. These rules are not a self-diagnosis tool. If you cannot walk or the ankle is badly swollen or deformed, seek in-person care.",
    "injuries", "ankle_sprain")
add("or_008", "Should I wrap a sprained ankle tightly?",
    "Light compression can help swelling, but a wrap should never be so tight that toes become cold, numb, blue, or more painful. Loosen it if tingling starts. Compression is only one part of first aid and does not replace medical evaluation when you cannot bear weight.",
    "injuries", "ankle_sprain")
add("or_009", "What is PRICE in injury first aid?",
    "PRICE adds Protection to Rest, Ice, Compression, and Elevation. Protection can mean a brace, crutches, or simply avoiding the movement that caused pain. The goal is to limit further damage in the first days while swelling settles. It is first aid, not a treatment plan for fractures or dislocations.",
    "injuries", "first_aid")
add("or_010", "Can I walk on a suspected fracture?",
    "Do not walk on a limb if it is deformed, you heard a crack, you cannot bear weight, or pain is severe. Use support and seek urgent care. Some fractures still allow limited walking, which is why inability to walk is a warning sign, not the only sign. Only a clinician and appropriate imaging can confirm a fracture.",
    "injuries", "fracture")

# --- knee ---
add("or_011", "What is osteoarthritis of the knee?",
    "Knee osteoarthritis is wear and inflammation of the joint cartilage and surrounding tissues. Typical features include activity-related pain, stiffness after rest, and reduced range of motion. Management often includes activity modification, strengthening of the quadriceps and hips, weight management if relevant, and clinician-guided pain strategies. It is not something this assistant can diagnose from a description. Persistent swelling, locking, or night pain needs in-person assessment.",
    "joints", "knee_oa")
add("or_012", "What exercises help knee osteoarthritis?",
    "Many people with knee osteoarthritis benefit from quadriceps strengthening, hip strengthening, and low-impact aerobic activity such as cycling or walking as tolerated. Range-of-motion work can reduce stiffness. Exercises should not produce sharp joint pain or swelling that lasts into the next day. A physiotherapist can tailor load. Stop and seek care if the knee locks, gives way repeatedly, or becomes hot and swollen.",
    "rehab", "knee_oa")
add("or_013", "What is an ACL injury?",
    "The anterior cruciate ligament (ACL) helps stabilize the knee, especially with pivoting. Injuries often occur with a twist, sudden stop, or landing. People sometimes feel a pop, followed by swelling and giving-way. This is educational information only. Suspected ACL injuries need clinical examination and often imaging. Do not return to cutting sports until a clinician clears you.",
    "injuries", "acl")
add("or_014", "How is ACL reconstruction recovery usually structured?",
    "After ACL reconstruction, rehabilitation is typically phased: early protection and swelling control, then range of motion and quadriceps activation, then strength and balance, then sport-specific work. Timelines vary by graft type and surgeon protocol. This assistant cannot prescribe your personal protocol. Follow your surgeon and physiotherapist. Red flags include fever, calf swelling with shortness of breath, wound drainage, or sudden giving-way.",
    "rehab", "acl")
add("or_015", "What is a meniscus tear?",
    "The meniscus is cartilage that cushions the knee. Tears can occur with twisting or from degeneration with age. Symptoms may include pain along the joint line, swelling, or catching. Not every tear needs surgery. A clinician decides based on examination and imaging. Locking of the knee in a bent position is a reason to seek prompt care.",
    "injuries", "meniscus")
add("or_016", "Why does my knee click?",
    "Painless clicking is often from tendons or gas in the joint and can be harmless. Painful clicking, locking, swelling, or giving-way is not something to ignore. Those features need clinical assessment. This assistant cannot tell whether clicking is harmless from a description alone.",
    "joints", "knee")
add("or_017", "What is runner's knee?",
    "Patellofemoral pain, sometimes called runner's knee, is pain around or behind the kneecap, often worse with stairs, squatting, or sitting with bent knees. Contributing factors can include training load, hip and quadriceps strength, and movement patterns. Relative rest from aggravating loads and gradual strengthening are common starting points. Persistent swelling or trauma needs examination.",
    "concerns", "patellofemoral")
add("or_018", "Should I use a knee brace for osteoarthritis?",
    "Some people with knee osteoarthritis find an unloading or simple sleeve brace helpful for comfort during walking. Braces do not reverse cartilage loss. Fit and indication matter, especially after injury or surgery. Ask a clinician or physiotherapist before relying on a brace as your main treatment.",
    "treatments", "bracing")
add("or_019", "What is a Baker's cyst?",
    "A Baker's cyst is a fluid-filled swelling behind the knee, often linked to arthritis or a meniscus problem. It can cause tightness or calf swelling if it leaks. Sudden calf swelling also raises concern for blood clots, which is a medical emergency to rule out. Do not self-diagnose a cyst versus a clot.",
    "joints", "knee")
add("or_020", "Is cracking knees dangerous?",
    "Painless joint cracking without swelling or loss of function is usually not dangerous. Pain, swelling, locking, or instability is different and deserves clinical review. Habitual forceful cracking is not a proven way to treat joints.",
    "general", "crepitus")

# --- shoulder ---
add("or_021", "What is a rotator cuff?",
    "The rotator cuff is a group of muscles and tendons that stabilize the shoulder and help lift and rotate the arm. Irritation or tears can cause pain with overhead activity, night pain when lying on the side, and weakness. Many partial irritations improve with load management and physiotherapy. Traumatic weakness after a fall needs prompt orthopedic assessment.",
    "joints", "rotator_cuff")
add("or_022", "What is frozen shoulder?",
    "Frozen shoulder (adhesive capsulitis) involves progressive stiffness and pain in the shoulder capsule, often over months. It may follow injury, surgery, or occur with diabetes. Recovery can be slow. Physiotherapy and clinician-guided care are typical. Sudden inability to lift the arm after trauma is not typical frozen shoulder and needs urgent review.",
    "joints", "frozen_shoulder")
add("or_023", "Why does my shoulder hurt at night?",
    "Night shoulder pain is common with rotator cuff irritation and frozen shoulder, especially when lying on that side. It is not a diagnosis by itself. Pain with fever, unexplained weight loss, chest pain, or arm numbness needs urgent medical evaluation. Persistent night pain should be assessed in clinic.",
    "concerns", "shoulder_pain")
add("or_024", "What is shoulder impingement?",
    "Shoulder impingement describes pain when the rotator cuff tendons are compressed during overhead motion. It is a clinical description, not a single disease. Treatment often focuses on posture, scapular control, and gradual strengthening rather than complete rest. A clinician should rule out full-thickness tears after trauma.",
    "joints", "shoulder")
add("or_025", "How do I sleep with shoulder pain?",
    "Many people are more comfortable on the uninjured side with a pillow supporting the painful arm, or on the back with a pillow under the forearm. Avoid long stretches of lying directly on the painful shoulder. This is comfort advice only. Worsening weakness or trauma history needs examination.",
    "general", "sleep")
add("or_026", "What is a dislocated shoulder?",
    "A dislocated shoulder means the ball of the humerus has come out of the socket. It is a medical emergency. Do not try to force it back in yourself. Keep the arm supported and seek urgent care. After reduction, a clinician will advise on immobilization and rehab because repeat dislocations can occur.",
    "injuries", "dislocation")
add("or_027", "Can I lift weights with rotator cuff pain?",
    "Heavy overhead pressing often aggravates rotator cuff pain. Many programs temporarily reduce overhead load and emphasize pain-free range, scapular work, and external rotation strength. Return to lifting should be graded. Sharp pain, night pain that is escalating, or weakness after a pop needs clinical review before you push through.",
    "rehab", "rotator_cuff")

# --- spine ---
add("or_028", "What is sciatica?",
    "Sciatica describes pain that radiates from the lower back into the leg, often along the path of the sciatic nerve. It can be caused by disc irritation or other spine conditions. Most uncomplicated episodes improve with time, activity as tolerated, and guided exercise. Red flags include bowel or bladder change, saddle numbness, or rapidly worsening leg weakness — those need emergency care.",
    "joints", "spine")
add("or_029", "What should I do for acute lower back pain?",
    "For many simple back-pain episodes, staying gently active is better than prolonged bed rest. Short rest is reasonable if pain is severe, then return to walking and daily tasks as tolerated. Heat may ease muscle spasm. Seek urgent care for trauma, fever, unexplained weight loss, cancer history, or neurological red flags such as saddle numbness or loss of bladder control.",
    "concerns", "back_pain")
add("or_030", "Is bed rest good for back pain?",
    "Prolonged bed rest is generally not recommended for simple mechanical back pain because it can increase stiffness and deconditioning. A day or two of easier activity can help, then gradual return to walking. This does not apply to fractures, infection, or neurological emergencies, which need medical care.",
    "rehab", "back_pain")
add("or_031", "What is a herniated disc?",
    "A herniated disc occurs when disc material irritates nearby nerves. It can cause back pain, leg pain, or numbness. Many improve without surgery. Progressive weakness, saddle anesthesia, or bladder dysfunction is an emergency. This assistant cannot diagnose a disc herniation from symptoms alone.",
    "joints", "spine")
add("or_032", "What is cauda equina syndrome?",
    "Cauda equina syndrome is a rare but serious compression of nerves at the base of the spine. Warning features include saddle numbness, new bowel or bladder dysfunction, and severe or progressive leg weakness. It is a medical emergency. Go to emergency care immediately if these occur. This is not something to wait on or self-treat.",
    "safety", "red_flags")
add("or_033", "How do I sit with lower back pain?",
    "Change position often. A small lumbar support or sitting with hips and knees near 90 degrees can help some people. Avoid long slouched sitting. Walking breaks every 30 to 45 minutes are useful. Persistent pain after trauma or with neurological symptoms needs a clinician, not just chair adjustments.",
    "general", "ergonomics")
add("or_034", "What is cervical radiculopathy?",
    "Cervical radiculopathy is nerve-root irritation in the neck that can send pain, tingling, or weakness into the arm. Gentle mobility and load management are often used when symptoms are mild. Worsening arm weakness, gait change, or hand clumsiness needs prompt medical assessment.",
    "joints", "neck")
add("or_035", "Should I crack my neck or back?",
    "Forceful self-manipulation is not a recommended treatment and can be harmful, especially in the neck. Gentle mobility exercises from a physiotherapist are safer. Sudden severe headache, dizziness, or neurological symptoms after neck cracking need emergency care.",
    "safety", "manipulation")

# --- hip / other joints ---
add("or_036", "What is hip osteoarthritis?",
    "Hip osteoarthritis involves cartilage wear in the hip joint. Pain is often in the groin, buttock, or thigh and may worsen with walking or rising from a chair. Activity modification, strengthening, and walking aids can help some people. Sudden inability to walk after a fall in older adults raises concern for fracture and needs urgent care.",
    "joints", "hip_oa")
add("or_037", "Why does my hip click?",
    "Hip clicking can come from tendons snapping over bone or from inside the joint. Painless clicking can be benign. Painful clicking, catching, or giving-way needs clinical assessment. This assistant cannot distinguish causes from a description.",
    "joints", "hip")
add("or_038", "What is greater trochanteric pain?",
    "Pain on the outside of the hip is often related to the gluteal tendons or bursae rather than the hip joint itself. It can hurt when lying on that side or climbing stairs. Load management and targeted strengthening are common approaches. Fever or inability to weight-bear needs medical review.",
    "concerns", "hip_pain")
add("or_039", "What is plantar fasciitis?",
    "Plantar fasciitis is irritation of the tissue along the bottom of the foot, often causing first-step pain in the morning. Relative rest from aggravating impact, calf stretching, supportive footwear, and gradual loading are typical starting strategies. Sudden traumatic foot pain with inability to walk needs examination for other injuries.",
    "concerns", "plantar_fasciitis")
add("or_040", "How do I treat plantar fasciitis at home?",
    "Common self-care includes reducing painful running or jumping for a period, calf and plantar stretches, supportive shoes, and avoiding walking barefoot on hard floors. Improvement can take weeks. Night splints are sometimes used. See a clinician if you have numbness, swelling of the whole foot, or pain after a tear-like pop in the arch.",
    "rehab", "plantar_fasciitis")
add("or_041", "What is tennis elbow?",
    "Tennis elbow (lateral epicondylalgia) is pain on the outer elbow from overloaded wrist-extensor tendons. It can occur without playing tennis. Activity modification and graded strengthening of the forearm are usual first steps. Numbness in the hand or a traumatic deformity needs a different evaluation.",
    "concerns", "tennis_elbow")
add("or_042", "What is golfer's elbow?",
    "Golfer's elbow is pain on the inner elbow from the wrist-flexor tendons. Treatment principles are similar to tennis elbow: reduce aggravating grip and lift, then rebuild load. Persistent numbness or weakness in the hand should be assessed medically.",
    "concerns", "golfers_elbow")
add("or_043", "What is carpal tunnel syndrome?",
    "Carpal tunnel syndrome involves pressure on the median nerve at the wrist, often causing night tingling in the thumb, index, and middle fingers. Wrist-neutral night positioning is a common first measure. Progressive weakness, dropping objects, or constant numbness needs clinical care. This is not a diagnosis from chat.",
    "joints", "wrist")
add("or_044", "How should I wear a wrist splint for night tingling?",
    "A neutral wrist splint worn at night can reduce flexed-wrist pressure for some people with tingling in the fingers. The splint should not cut off circulation. It does not replace evaluation if weakness is progressing or if symptoms follow a fracture.",
    "treatments", "bracing")
add("or_045", "What is a stress fracture?",
    "A stress fracture is a small bone crack from repetitive load, common in the foot, shin, or hip in athletes. Pain typically increases with activity and eases with rest. Continuing to train through suspected stress fractures can worsen them. Hip or groin stress-fracture pain needs prompt assessment because some sites are high risk.",
    "injuries", "fracture")
add("or_046", "What is a bone bruise?",
    "A bone bruise is marrow edema from impact, seen on MRI. It can be painful and take weeks to months to settle. Management is usually protected loading as advised by a clinician. It is not something to self-diagnose without imaging.",
    "injuries", "fracture")

# --- rehab principles ---
add("or_047", "What is POLICE for soft tissue injury?",
    "POLICE stands for Protection, Optimal Loading, Ice, Compression, and Elevation. Compared with complete rest, optimal loading means using the injured part in a pain-tolerable way to support healing. It is a general framework, not a prescription for fractures or surgical repairs.",
    "rehab", "principles")
add("or_048", "What does optimal loading mean in rehab?",
    "Optimal loading means enough movement and load to stimulate healing without repeatedly inflaming the tissue. Pain during exercise that settles quickly the same day is often acceptable in guided programs. Pain that spikes and lasts into the next day usually means the load was too high. A physiotherapist individualizes this.",
    "rehab", "principles")
add("or_049", "When can I return to sport after a sprain?",
    "Return is usually based on pain, swelling, strength, balance, and sport-specific control — not a calendar date alone. Being pain-free walking does not always mean you can cut and jump. A clinician or physiotherapist should guide return after moderate or severe injuries.",
    "rehab", "return_to_sport")
add("or_050", "What are isometric exercises?",
    "Isometric exercises involve contracting a muscle without moving the joint, such as pushing against an immovable object. They are often used early when movement is painful. They should not cause sharp joint pain. Technique and dosage should be confirmed with a clinician if you are post-operative.",
    "rehab", "exercise")
add("or_051", "Why is quadriceps strengthening important after knee injury?",
    "The quadriceps help control the knee during walking and stairs. After injury or surgery they often weaken quickly. Guided strengthening is a core part of many knee rehab plans. Do not start aggressive loaded squats if the knee is hot, locked, or you are under post-op restrictions.",
    "rehab", "knee")
add("or_052", "What is proprioception?",
    "Proprioception is the sense of joint position. After sprains it is often impaired, which can increase re-injury risk. Balance and control drills are used to retrain it. These should be progressed from stable to unstable surfaces as pain allows.",
    "rehab", "principles")
add("or_053", "Should I stretch a pulled hamstring?",
    "Aggressive stretching in the first days after a hamstring strain can aggravate the tear. Early care is usually relative rest, gentle pain-free movement, then progressive strengthening. A physiotherapist can time stretching. A sudden pop with a palpable gap needs medical assessment.",
    "rehab", "hamstring")
add("or_054", "What is eccentric exercise?",
    "Eccentric exercise emphasizes the lowering or lengthening phase of a movement, such as a slow heel drop for Achilles tendons. It is used in some tendon programs. It can make tendons sore if dosed too hard. It is not appropriate for every injury, especially acute tears or unhealed fractures.",
    "rehab", "tendon")
add("or_055", "How often should I do physiotherapy exercises?",
    "Many home programs are done daily or several times per week, in short sessions, as prescribed. More is not always better. Quality and symptom response matter. Follow the plan from your physiotherapist, especially after surgery.",
    "rehab", "exercise")
add("or_056", "Can I exercise with joint swelling?",
    "Mild swelling after activity that settles overnight can occur in irritable joints. Marked swelling, heat, fever, or swelling that does not settle needs clinical review. Do not train through a hot, very swollen joint after trauma.",
    "rehab", "principles")

# --- treatments / supports ---
add("or_057", "Do over-the-counter pain relievers help orthopedic pain?",
    "Some people use clinician-approved over-the-counter pain relievers for short-term musculoskeletal pain. This assistant does not prescribe medicines, doses, or combinations. People with kidney, stomach, heart, or bleeding issues, or those who are pregnant, need pharmacist or doctor advice before any medicine.",
    "treatments", "medication")
add("or_058", "Is complete rest the best treatment for tendon pain?",
    "Complete rest often reduces symptoms briefly but can leave the tendon deconditioned. Modern tendon care usually uses relative rest from the painful spike in load, then graded strengthening. Complete immobilization is for specific injuries such as some fractures, as directed by a clinician.",
    "rehab", "tendon")
add("or_059", "What does a walking boot do?",
    "A walking boot protects the foot or ankle by limiting motion while still allowing some walking. It is used for certain fractures, severe sprains, or post-op protocols. Using a boot without a diagnosis can hide a problem that needs different care. Follow the clinician who prescribed it for duration and weaning.",
    "treatments", "bracing")
add("or_060", "When are crutches needed?",
    "Crutches are used when you must keep weight off a limb after fracture, severe sprain, or surgery. Incorrect height or technique can cause nerve irritation in the arms. A clinician or physiotherapist should fit them. Increasing pain, numbness, or inability to manage stairs safely needs follow-up.",
    "treatments", "mobility_aids")
add("or_061", "What is a sling used for?",
    "A sling supports the arm after shoulder injury, dislocation, or some fractures. Duration depends on the diagnosis. Too long in a sling can stiffen the elbow and shoulder. Follow the clinician's timeline for coming out of the sling and starting movement.",
    "treatments", "bracing")
add("or_062", "Does massage fix orthopedic injuries?",
    "Massage may temporarily ease muscle tightness. It does not set bones, repair complete ligament tears, or replace rehabilitation. Avoid deep massage on acute tears, fractures, infection, or unexplained swelling.",
    "treatments", "manual")
add("or_063", "Is cracking a joint the same as chiropractic adjustment?",
    "Joint cavitation sounds are not proof of treatment success. Forceful neck manipulation has rare but serious risks. This educational assistant does not recommend unsupervised manipulation. Discuss manual therapy with licensed clinicians.",
    "treatments", "manual")
add("or_064", "What is an orthopedic cast for?",
    "A cast holds a reduced fracture or protected joint still while bone heals. Keep it dry unless it is a waterproof type you were told to use. Seek care for increasing pain, numbness, blue toes or fingers, or a wet or damaged cast.",
    "treatments", "fracture_care")
add("or_065", "What is compartment syndrome?",
    "Acute compartment syndrome is dangerous pressure in a muscle compartment, often after fracture or crush injury. Severe pain out of proportion, pain with passive stretch, and later numbness are warnings. It is a surgical emergency. Go to emergency care immediately. Do not wait for a chat answer.",
    "safety", "red_flags")

# --- post-op / hip knee replacement educational ---
add("or_066", "What is a total knee replacement in simple terms?",
    "Total knee replacement is surgery that resurfaces worn joint surfaces with implants. It is considered when pain and function remain poor after non-surgical care. Rehab after surgery is essential. This assistant cannot decide if you need surgery.",
    "treatments", "surgery")
add("or_067", "What is hip replacement recovery like generally?",
    "After hip replacement, people usually start walking with support in hospital and progress with physiotherapy. Precautions depend on surgical approach. Watch for fever, calf pain, sudden shortness of breath, wound drainage, or dislocation symptoms such as a pop with inability to move. Those need urgent care.",
    "rehab", "hip_replacement")
add("or_068", "When should a surgical wound be checked?",
    "Seek care for spreading redness, pus, fever, wound opening, or heavy bleeding. Mild bruising can be normal. Do not ignore rapidly increasing pain or a foul-smelling wound. Follow your surgeon's dressing instructions.",
    "safety", "post_op")
add("or_069", "Why is blood clot risk discussed after orthopedic surgery?",
    "Reduced mobility after surgery increases risk of clots in the legs that can travel to the lungs. Warning signs include new calf swelling and pain, chest pain, or shortness of breath — those are emergencies. Prevention is directed by the surgical team, not by this assistant.",
    "safety", "post_op")
add("or_070", "Can I drive after orthopedic surgery?",
    "Driving depends on the limb involved, whether you are on impairing medicines, and your surgeon's advice. Being able to perform an emergency stop safely matters. Do not drive based on a general chatbot timeline.",
    "rehab", "post_op")

# --- red flags / safety ---
add("or_071", "When is bone or joint pain an emergency?",
    "Seek emergency care for open fractures, deformity, loss of pulse or color in a limb, sudden inability to walk after trauma, suspected dislocation, saddle numbness, bowel or bladder change, chest pain with calf swelling, or fever with a hot joint. Chat cannot replace emergency services.",
    "safety", "red_flags")
add("or_072", "What is a hot swollen joint a warning for?",
    "A hot, very swollen joint, especially with fever, can indicate infection, which is an orthopedic emergency. Do not start exercises or delay care. Go to urgent or emergency medical services.",
    "safety", "red_flags")
add("or_073", "Should I ignore numbness after an injury?",
    "New numbness, tingling that is worsening, or weakness after injury can mean nerve or circulation problems. Seek prompt medical care, especially if a limb is cold, pale, or you cannot move it.",
    "safety", "red_flags")
add("or_074", "What if I heard a pop in my knee?",
    "A pop with swelling, giving-way, or inability to continue sport is a common story in ligament injuries. It is not a diagnosis by itself. Stop pivoting sport and get a clinical examination. Do not tape it and return the same day.",
    "injuries", "knee")
add("or_075", "Can orthopedic pain come from the heart or abdomen?",
    "Yes. Shoulder, back, or hip-region pain can occasionally be referred from the chest or abdomen. Chest pain, shortness of breath, fainting, or pain after a fall in older adults needs emergency evaluation, not musculoskeletal self-care alone.",
    "safety", "red_flags")

# --- extra FAQs to reach ~100 ---
add("or_076", "What is bursitis?",
    "A bursa is a small fluid sac that reduces friction. Bursitis is irritation of that sac, causing local pain with movement or pressure. Common sites include the shoulder, elbow, and outer hip. Activity modification is often used. Fever and rapidly increasing redness need infection to be ruled out.",
    "concerns", "bursitis")
add("or_077", "What is tendinopathy?",
    "Tendinopathy is a painful tendon condition related to load, more than a simple one-time tear. Morning stiffness and pain with use are common. Graded loading programs are a mainstay. Complete rest or aggressive stretching alone is often not enough. Sudden traumatic pops are a different problem.",
    "concerns", "tendon")
add("or_078", "What is Osgood-Schlatter disease?",
    "Osgood-Schlatter is activity-related pain at the bump below the kneecap in growing adolescents. Load management and quadriceps flexibility work are often used. It is not treated by this chat as a diagnosis. Persistent night pain or a limp that does not settle needs a clinician.",
    "joints", "pediatric")
add("or_079", "Should children play through growing-pain in a joint?",
    "Activity-related pain in a single joint, night pain that wakes a child, fever, or a limp should not be dismissed as growing pains. Those need medical assessment. This assistant does not diagnose pediatric orthopedic conditions.",
    "safety", "pediatric")
add("or_080", "What is scoliosis?",
    "Scoliosis is a sideways curvature of the spine. Mild curves may be observed. Treatment decisions depend on age, curve size, and progression and belong with specialists. Sudden severe back pain with neurological signs is not typical simple scoliosis care.",
    "joints", "spine")
add("or_081", "How can I protect my back when lifting?",
    "Keep the load close, avoid twisting while lifting, and use your legs for heavier objects. Get help for awkward loads. These habits reduce strain but do not prevent every injury. Sudden severe pain with neurological red flags needs emergency care.",
    "general", "ergonomics")
add("or_082", "What shoes help plantar fasciitis?",
    "Supportive shoes with a modest heel and cushioned midsole help some people more than very flat, unsupportive shoes. This is general advice. Custom orthotics are a clinician decision. Sudden traumatic foot pain is not plantar fasciitis until examined.",
    "treatments", "footwear")
add("or_083", "What is a fracture versus a break?",
    "In everyday language, a broken bone and a fracture mean the same thing: the bone's continuity is disrupted. Severity ranges from hairline cracks to displaced breaks. Only imaging and a clinician can classify them. Do not assume a bone is intact because you can wiggle toes.",
    "injuries", "fracture")
add("or_084", "Do I need an X-ray after every fall?",
    "Not every fall needs an X-ray. Inability to bear weight, deformity, severe localized bone pain, or high-energy trauma increases the likelihood that imaging is needed. Older adults with hip pain after a fall should be assessed even if they can shuffle, because hip fractures can be missed.",
    "injuries", "fracture")
add("or_085", "What is osteoporosis in orthopedic terms?",
    "Osteoporosis is reduced bone strength that increases fracture risk, especially in the wrist, spine, and hip. Exercise, fall prevention, and medical treatment are clinician-directed. This assistant does not prescribe osteoporosis drugs. A fragility fracture (break from a simple fall) should trigger medical follow-up.",
    "general", "bone_health")
add("or_086", "Can walking help osteoarthritis?",
    "Regular walking as tolerated is often encouraged for knee and hip osteoarthritis because it supports joint nutrition, mood, and muscle endurance. Use supportive shoes and build distance gradually. Stop and seek care if walking produces locking, giving-way, or severe swelling.",
    "rehab", "oa")
add("or_087", "What is a labral tear of the hip or shoulder?",
    "The labrum is a rim of cartilage that deepens the socket. Tears can cause catching or pain. Not all labral findings on MRI explain symptoms. Treatment ranges from physiotherapy to surgery and is individualized. This chat cannot diagnose a labral tear.",
    "injuries", "labrum")
add("or_088", "What is IT band syndrome?",
    "Iliotibial band syndrome is outer-knee pain in runners and cyclists related to load and hip control. Reducing aggravating mileage and strengthening the hips are common approaches. Swelling of the whole knee or locking needs a different work-up.",
    "concerns", "knee")
add("or_089", "How do I know if my ankle is broken or sprained?",
    "You cannot reliably tell from home. Inability to take four steps, bone-point tenderness, deformity, or numbness leans toward needing urgent assessment and possible X-rays. A sprain can still be very painful. Get examined rather than guessing.",
    "injuries", "ankle_sprain")
add("or_090", "What is a Colles fracture?",
    "A Colles fracture is a common wrist fracture after a fall on an outstretched hand, more frequent in older adults with osteoporosis. It needs medical reduction and immobilization as indicated. Numbness, severe pain in cast, or pale fingers are emergencies.",
    "injuries", "wrist")
add("or_091", "What is a clavicle fracture?",
    "A broken collarbone often follows a fall onto the shoulder. A sling is commonly used. Deformity, breathing difficulty, or neurovascular symptoms need urgent care. Follow-up decides whether alignment is acceptable.",
    "injuries", "fracture")
add("or_092", "What is a hip fracture in older adults?",
    "Hip fractures after a fall in older adults are serious. Typical signs include inability to walk and a shortened, rotated leg, but presentations vary. This is an emergency. Do not try to walk it off. Call emergency services.",
    "injuries", "hip_fracture")
add("or_093", "How long do bones usually take to heal?",
    "Many uncomplicated adult fractures take about six to twelve weeks of healing, longer for some sites such as the tibia, and longer still in people who smoke or have certain medical conditions. Children often heal faster. Your surgeon's timeline overrides general ranges.",
    "injuries", "fracture")
add("or_094", "Does smoking affect bone healing?",
    "Smoking is associated with slower bone and wound healing and higher complication risk after orthopedic surgery. Quitting support is a medical topic for your care team. This is general information, not a lecture or a treatment plan.",
    "general", "bone_health")
add("or_095", "What is a ganglion cyst?",
    "A ganglion is a common fluid-filled lump, often on the wrist. It may fluctuate in size. Do not smash it. Rapid growth, unrelenting pain, or neurological symptoms should be examined. Treatment options belong with a clinician.",
    "joints", "wrist")
add("or_096", "What is trigger finger?",
    "Trigger finger is catching of a flexor tendon at the palm, causing a finger to stick then pop. Activity modification is sometimes tried. Sudden inability to straighten a finger after trauma is a different emergency (possible tendon rupture).",
    "joints", "hand")
add("or_097", "What is De Quervain's tenosynovitis?",
    "De Quervain's is irritation of tendons on the thumb side of the wrist, often with gripping or new parent lifting. Thumb spica splinting and load changes are common first steps. Numbness in the whole hand or trauma needs other evaluation.",
    "concerns", "wrist")
add("or_098", "How should I ice an injury safely?",
    "Use a commercial pack or ice wrapped in a thin cloth for about 10 to 15 minutes, with breaks, on intact skin. Do not fall asleep on ice. Avoid ice on poor circulation, open wounds, or numb skin. Ice is comfort care, not a cure for fractures.",
    "general", "ice_heat")
add("or_099", "What is the difference between an orthopedic surgeon and a physiotherapist?",
    "Orthopedic surgeons diagnose and operate on bones, joints, and related structures. Physiotherapists specialize in movement, exercise, and rehabilitation. Many orthopedic problems are managed without surgery. For emergencies, use emergency services first.",
    "general", "care_team")
add("or_100", "Is this orthopedic assistant a doctor?",
    "No. This is an educational QnA assistant. It does not diagnose, read scans, prescribe medicines, or replace an orthopedic surgeon, emergency department, or physiotherapist. For red-flag symptoms, seek in-person emergency care.",
    "general", "disclaimer")
add("or_101", "What is a good routine for a mild ankle sprain?",
    "For a typical mild sprain, first-aid in the first two to three days is rest from painful loading, ice in short sessions, light compression, and elevation. Then begin gentle ankle pumps and weight-bearing as pain allows, followed by balance work. This is general education. Inability to walk, deformity, or numbness needs in-person care — do not follow a home routine in those cases.",
    "routines", "ankle_sprain")
add("or_102", "I have knee osteoarthritis, occasional swelling after walking, and I already do quadriceps sets. How should I structure this week's activity?",
    "This kind of question is personalized. In general, keep walks at a distance that does not cause swelling lasting into the next day, add rest or cycling on irritable days, and continue quadriceps and hip strengthening if they stay comfortable. A physiotherapist should set the exact volume. Hot, locked, or rapidly worsening knees need clinical review rather than a self-made weekly plan.",
    "routines", "knee_oa")

assert len(entries) >= 100, len(entries)
path = Path(__file__).with_name("ortho_kb.json")
path.write_text(json.dumps(entries, indent=2), encoding="utf-8")
print(f"Wrote {len(entries)} entries to {path}")
