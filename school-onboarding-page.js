(function () {
    // Load Supabase client
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.onload = initApp;
    document.head.appendChild(script);

    function initApp() {
        // Initialize Supabase with your credentials
        const supabaseUrl = "https://xcbhuippckldllxewdbk.supabase.co";
        const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjYmh1aXBwY2tsZGxseGV3ZGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5ODQ1ODksImV4cCI6MjA4NDU2MDU4OX0.SfBvTIYL9Ww8M6lCN_GJ8rNVze1HbldMqgMu_GqSAuM";

        const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

        // DOM elements
        const form = document.getElementById("onboardingForm");
        const submitBtn = document.getElementById("submitBtn");
        const successSection = document.getElementById("successSection");
        const alertContainer = document.getElementById("alertContainer");

        if (!form) {
            console.error("Form not found");
            return;
        }

        // Submit handler
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            // Set loading state
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Processing...';

            // Get form values
            const orgName = document.getElementById("orgName").value.trim();
            const address = document.getElementById("address").value.trim();
            const adminEmail = document.getElementById("adminEmail").value.trim();

            // Validation
            if (!orgName || !address || !adminEmail) {
                showAlert("Please fill in all required fields", "error");
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                return;
            }

            try {
                // Call Supabase RPC function
                console.log("Registering organization:", { orgName, address });

                const { data, error } = await supabase.rpc("onboard_organization", {
                    p_organization_name: orgName,
                    p_address: address,
                    p_country_code: "NG",
                    // Note: Function doesn't accept admin_email yet
                    // If you add it later, include: p_admin_email: adminEmail
                });

                if (error) {
                    console.error("Database error:", error);
                    throw new Error(`Registration failed: ${error.message}`);
                }

                if (!data || data.length === 0) {
                    throw new Error("No response from server. Please try again.");
                }

                // SUCCESS - Function returns: organization_name, slug, login_code
                console.log("Success! Data received:", data);
                
                const result = data[0];
                
                // Update the success display with the exact data from your function
                document.getElementById("loginCode").textContent = result.login_code;
                document.getElementById("schoolNameDisplay").textContent = result.organization_name;
                document.getElementById("schoolSlug").textContent = result.slug;
                
                // Hide form, show success
                successSection.style.display = "block";
                form.style.display = "none";
                
                // Clear any alerts
                alertContainer.innerHTML = "";
                
                // Show success message
                showAlert(`✅ School registered successfully! Your login code is ready.`, "success");

            } catch (err) {
                console.error("Registration error:", err);
                showAlert(err.message, "error");
            } finally {
                // Reset button only if not successful
                if (!successSection.style.display || successSection.style.display === "none") {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            }
        });

        // Alert function
        function showAlert(message, type = "error") {
            alertContainer.innerHTML = `
                <div class="alert alert-${type}" style="display: flex;">
                    <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'} alert-icon"></i>
                    <div>${message}</div>
                </div>
            `;
            
            if (type === "error") {
                setTimeout(() => {
                    alertContainer.innerHTML = "";
                }, 5000);
            }
        }

        // Update copyright year
        const yearElement = document.querySelector('.footer-bottom p');
        if (yearElement) {
            yearElement.innerHTML = `&copy; ${new Date().getFullYear()} Acadryx. Organization onboarding requires verification and approval.`;
        }
        
        console.log("Acadryx School Onboarding Dashboard ready");
    }
})();
