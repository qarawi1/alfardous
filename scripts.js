import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC5ZE1m5qe10pbAiZcSjBkIVDVNZExtf5U",
    authDomain: "elferdaws-1a362.firebaseapp.com",
    projectId: "elferdaws-1a362",
    storageBucket: "elferdaws-1a362.firebasestorage.app",
    messagingSenderId: "74289958469",
    appId: "1:74289958469:web:4ab94014a6afc191b61d2c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

async function checkAdmin(userId) {
    const userDocRef = doc(firestore, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        document.getElementById('adminActions').style.display = userData.isAdmin ? 'block' : 'none';
    } else {
        console.log("لا يوجد بيانات لهذا المستخدم");
        document.getElementById('adminActions').style.display = 'none';
    }
}

document.getElementById('loginBtn').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('registerForm').style.display = 'none';
            document.getElementById('appContent').style.display = 'block';

            checkAdmin(userCredential.user.uid);
        })
        .catch((error) => {
            document.getElementById('errorLogin').style.display = 'block';
            document.getElementById('errorLogin').textContent = 'فشل تسجيل الدخول: ' + error.message;
        });
});

document.getElementById('registerBtn').addEventListener('click', () => {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
            alert('تم إنشاء الحساب بنجاح!');
            showLoginForm();
        })
        .catch((error) => {
            document.getElementById('errorRegister').style.display = 'block';
            document.getElementById('errorRegister').textContent = 'فشل إنشاء الحساب: ' + error.message;
        });
});

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
}

document.getElementById('registerRedirectBtn').addEventListener('click', showRegisterForm);
document.getElementById('loginRedirectBtn').addEventListener('click', showLoginForm);

async function searchMotor() {
    const searchQuery = document.getElementById("searchMotor").value.toLowerCase();
    const tableBody = document.getElementById("motorsTable").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = ""; // تفريغ الجدول

    try {
        // جلب البيانات من Firebase
        const motorsCollectionRef = collection(firestore, "motors");
        const motorsSnapshot = await getDocs(motorsCollectionRef);
        const motorsList = motorsSnapshot.docs.map(doc => doc.data());

        // تصفية النتائج بناءً على البحث
        const filteredMotors = motorsList.filter(motor =>
            Object.values(motor).some(value => {
                if (typeof value === "string") {
                    return value.toLowerCase().includes(searchQuery);
                } else {
                    return value.toString().includes(searchQuery);
                }
            })
        );

        if (filteredMotors.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='16'>لا توجد نتائج مطابقة</td></tr>";
        } else {
            // ترتيب الحقول الذي يجب عرضه
            const fieldOrder = [
                "model",
                "hp",
                "w",
                "rla_amperage",
                "displacement",
                "kcal_hr",
                "btu",
                "w_23",
                "w_5",
                "w_72",
                "application",
                "refrigerant",
                "manufacturer",
                "electricity",
                "running_capacitor",
                "starting_capacitor"
            ];

            // عرض النتائج في الجدول
            filteredMotors.forEach(motor => {
                const row = document.createElement("tr");
                fieldOrder.forEach(field => {
                    const cell = document.createElement("td");
                    if (motor[field]) {
                        // إذا كان الحقل موجودًا وله قيمة
                        cell.textContent = motor[field];
                    } else {
                        // ترك الحقل فارغًا إذا لم يكن موجودًا
                        cell.textContent = "";
                    }
                    row.appendChild(cell);
                });
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error("حدث خطأ أثناء البحث:", error);
        alert("فشل البحث، يرجى المحاولة لاحقًا.");
    }
}



// ربط الدالة للبيئة العامة
window.searchMotor = searchMotor;

// أو ربط الحدث مباشرة في JavaScript
document.getElementById("searchMotor").addEventListener("input", searchMotor);

// إظهار نموذج تسجيل موتور جديد
function showMotorForm() {
    hideAllSections(); // تأكد من أن هذه الدالة موجودة وتخفي جميع الأقسام الأخرى
    document.getElementById('motorForm').style.display = 'block'; // عرض نموذج الموتور
    document.querySelector('.top-bar').style.display = 'block'; // عرض الشريط العلوي
}

function hideAllSections() {
    const sections = document.querySelectorAll('#appContent > div');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    console.log("تم إخفاء جميع الأقسام");
}

// تأكد من عرض جميع العناصر المطلوبة عند الضغط على زر إلغاء
document.getElementById("cancelMotorBtn").addEventListener("click", () => {
    console.log("تم الضغط على زر إلغاء");
    document.getElementById("motorForm").style.display = "none"; // إخفاء نموذج الموتور
    document.getElementById("appContent").style.display = "block"; // عرض محتوى التطبيق
    document.querySelector('.top-bar').style.display = 'block'; // عرض الشريط العلوي
    const otherSections = document.querySelectorAll('#appContent > div');
    otherSections.forEach(section => {
        if (section.id !== 'motorForm') {
            section.style.display = 'block'; // إعادة عرض الأقسام الأخرى
        }
    });
    searchMotor(); // تحديث جدول الموتورات بعد الإلغاء
});

document.getElementById('showMotorForm').addEventListener('click', showMotorForm);

// مصفوفة لتخزين بيانات الموتورات
// لا حاجة لتعريف مكرر للمتغير motors

document.getElementById("saveMotorBtn").addEventListener("click", async () => {
    console.log("تم الضغط على زر حفظ");
    const motor = {
        model: document.getElementById("motorModel").value || "غير متوفر",
        hp: document.getElementById("motorHP").value || "غير متوفر",
        w: document.getElementById("motorW").value || "غير متوفر",
        rla_amperage: document.getElementById("motorRLA").value || "غير متوفر",
        displacement: document.getElementById("motorDisplCC").value || "غير متوفر",
        kcal_hr: document.getElementById("motorKCAL").value || "غير متوفر",
        btu: document.getElementById("motorBTU").value || "غير متوفر",
        w_23: document.getElementById("motorW23").value || "غير متوفر",
        w_5: document.getElementById("motorW5").value || "غير متوفر",
        w_72: document.getElementById("motorW72").value || "غير متوفر",
        application: document.getElementById("motorApplication").value || "غير متوفر",
        refrigerant: document.getElementById("motorRefrigerant").value || "غير متوفر",
        manufacturer: document.getElementById("motorManufacturer").value || "غير متوفر",
        electricity: document.getElementById("motorElectricity").value || "غير متوفر",
        running_capacitor: document.getElementById("motorRunningCapacitor").value || "غير متوفر",
        starting_capacitor: document.getElementById("motorStartingCapacitor").value || "غير متوفر"
    };

    try {
        await addDoc(collection(firestore, "motors"), motor);
        alert("تم حفظ البيانات بنجاح!");

 
        // تفريغ الحقول بعد الحفظ
        document.getElementById("motorModel").value = "";
        document.getElementById("motorHP").value = "";
        document.getElementById("motorW").value = "";
        document.getElementById("motorRLA").value = "";
        document.getElementById("motorDisplCC").value = "";
        document.getElementById("motorKCAL").value = "";
        document.getElementById("motorBTU").value = "";
        document.getElementById("motorW23").value = "";
        document.getElementById("motorW5").value = "";
        document.getElementById("motorW72").value = "";
        document.getElementById("motorApplication").value = "";
        document.getElementById("motorRefrigerant").value = "";
        document.getElementById("motorManufacturer").value = "";
        document.getElementById("motorElectricity").value = "";
        document.getElementById("motorRunningCapacitor").value = "";
        document.getElementById("motorStartingCapacitor").value = "";

        searchMotor(); // تحديث جدول الموتورات بعد الإضافة

    } catch (error) {
        console.log("حدث خطأ أثناء الحفظ:", error.message);
        alert("حدث خطأ أثناء الحفظ: " + error.message);
    }
});

document.getElementById("uploadBtn").addEventListener("click", async () => {
    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length === 0) {
        alert("يرجى اختيار ملف!");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
        try {
            // قراءة الملف باستخدام SheetJS
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            // اختيار أول شيت وتحويله إلى JSON
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const motorsData = XLSX.utils.sheet_to_json(firstSheet);

            // رفع البيانات إلى Firebase Firestore
            for (const motor of motorsData) {
                await addDoc(collection(firestore, "motors"), motor);
            }

            alert("تم رفع البيانات بنجاح!");
        } catch (error) {
            console.error("حدث خطأ أثناء رفع الملف:", error);
            alert("فشل رفع الملف!");
        }
    };

    reader.readAsArrayBuffer(file);
});

