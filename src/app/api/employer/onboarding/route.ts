import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Types for onboarding data
interface CompanyInfo {
    legalName: string;
    dba: string;
    entityType: 'llc' | 'corporation' | 's_corp' | 'partnership' | 'sole_proprietorship' | 'nonprofit';
    industry: string;
    ein: string;
    address: {
        street1: string;
        street2: string;
        city: string;
        state: string;
        zipCode: string;
    };
    phone: string;
    website: string;
}

interface PayrollSetup {
    payFrequency: 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly';
    firstPayDate: string;
    employeeCount: string;
    hasContractors: boolean;
}

interface BankingInfo {
    bankName: string;
    accountType: 'checking' | 'savings';
    routingNumber: string;
    accountNumber: string;
    useMercury: boolean;
}

interface BenefitsConfig {
    offersHealthInsurance: boolean;
    healthInsuranceProvider?: string;
    healthEmployerContributionPct: number;
    offers401k: boolean;
    hasEmployerMatch: boolean;
    employerMatchPct: number;
    employerMatchLimitPct: number;
    offersPto: boolean;
    ptoDaysPerYear: number;
    offersDental: boolean;
    offersVision: boolean;
    offersLifeInsurance: boolean;
}

interface OnboardingData {
    companyInfo?: CompanyInfo;
    payrollSetup?: PayrollSetup;
    bankingInfo?: BankingInfo;
    benefitsConfig?: BenefitsConfig;
    currentStep?: string;
    completed?: boolean;
}

// GET - Retrieve existing onboarding data
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get company with all related data
        const { data: company, error: companyError } = await supabase
            .from('employer_companies')
            .select(`
                *,
                payroll_config:employer_payroll_config(*),
                banking:employer_banking(*),
                benefits_config:employer_benefits_config(*)
            `)
            .eq('user_id', user.id)
            .single();

        if (companyError && companyError.code !== 'PGRST116') { // PGRST116 = not found
            console.error('Error fetching company:', companyError);
            return NextResponse.json({ error: 'Failed to fetch onboarding data' }, { status: 500 });
        }

        // Transform to frontend format
        if (company) {
            const data: OnboardingData = {
                companyInfo: {
                    legalName: company.legal_name,
                    dba: company.dba_name || '',
                    entityType: company.entity_type,
                    industry: company.industry || '',
                    ein: company.ein,
                    address: {
                        street1: company.address_street1,
                        street2: company.address_street2 || '',
                        city: company.address_city,
                        state: company.address_state,
                        zipCode: company.address_zip,
                    },
                    phone: company.phone || '',
                    website: company.website || '',
                },
                currentStep: company.onboarding_step,
                completed: company.onboarding_completed,
            };

            // Add payroll config if exists
            if (company.payroll_config) {
                data.payrollSetup = {
                    payFrequency: company.payroll_config.pay_frequency,
                    firstPayDate: company.payroll_config.first_pay_date,
                    employeeCount: company.payroll_config.employee_count_range,
                    hasContractors: company.payroll_config.has_contractors,
                };
            }

            // Add banking if exists
            if (company.banking) {
                data.bankingInfo = {
                    bankName: company.banking.bank_name || '',
                    accountType: company.banking.account_type || 'checking',
                    routingNumber: '', // Don't return sensitive data
                    accountNumber: company.banking.account_number_masked || '',
                    useMercury: company.banking.use_mercury,
                };
            }

            // Add benefits if exists
            if (company.benefits_config) {
                const bc = company.benefits_config;
                data.benefitsConfig = {
                    offersHealthInsurance: bc.offers_health_insurance,
                    healthInsuranceProvider: bc.health_insurance_provider,
                    healthEmployerContributionPct: bc.health_employer_contribution_pct,
                    offers401k: bc.offers_401k,
                    hasEmployerMatch: bc.has_employer_match,
                    employerMatchPct: bc.employer_match_pct,
                    employerMatchLimitPct: bc.employer_match_limit_pct,
                    offersPto: bc.offers_pto,
                    ptoDaysPerYear: bc.pto_days_per_year,
                    offersDental: bc.offers_dental,
                    offersVision: bc.offers_vision,
                    offersLifeInsurance: bc.offers_life_insurance,
                };
            }

            return NextResponse.json(data);
        }

        return NextResponse.json({});
    } catch (error) {
        console.error('GET onboarding error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Save onboarding data (upsert)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: OnboardingData = await request.json();

        // Validate required company info
        if (body.companyInfo) {
            const { legalName, entityType, ein, address } = body.companyInfo;
            if (!legalName || !entityType || !ein) {
                return NextResponse.json({ error: 'Missing required company information' }, { status: 400 });
            }
            if (!address.street1 || !address.city || !address.state || !address.zipCode) {
                return NextResponse.json({ error: 'Missing required address information' }, { status: 400 });
            }
        }

        // Step 1: Upsert company
        let companyId: string;

        if (body.companyInfo) {
            const companyData = {
                user_id: user.id,
                legal_name: body.companyInfo.legalName,
                dba_name: body.companyInfo.dba || null,
                entity_type: body.companyInfo.entityType,
                industry: body.companyInfo.industry || null,
                ein: body.companyInfo.ein,
                address_street1: body.companyInfo.address.street1,
                address_street2: body.companyInfo.address.street2 || null,
                address_city: body.companyInfo.address.city,
                address_state: body.companyInfo.address.state,
                address_zip: body.companyInfo.address.zipCode,
                phone: body.companyInfo.phone || null,
                website: body.companyInfo.website || null,
                onboarding_step: body.currentStep || 'company',
                onboarding_completed: body.completed || false,
            };

            const { data: company, error: companyError } = await supabase
                .from('employer_companies')
                .upsert(companyData, { onConflict: 'user_id' })
                .select('id')
                .single();

            if (companyError) {
                console.error('Error upserting company:', companyError);
                return NextResponse.json({ error: 'Failed to save company data' }, { status: 500 });
            }

            companyId = company.id;
        } else {
            // Get existing company ID
            const { data: company } = await supabase
                .from('employer_companies')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!company) {
                return NextResponse.json({ error: 'Company not found. Please complete company info first.' }, { status: 400 });
            }
            companyId = company.id;
        }

        // Step 2: Upsert payroll config
        if (body.payrollSetup) {
            const payrollData = {
                company_id: companyId,
                pay_frequency: body.payrollSetup.payFrequency,
                first_pay_date: body.payrollSetup.firstPayDate,
                employee_count_range: body.payrollSetup.employeeCount,
                has_contractors: body.payrollSetup.hasContractors,
            };

            const { error: payrollError } = await supabase
                .from('employer_payroll_config')
                .upsert(payrollData, { onConflict: 'company_id' });

            if (payrollError) {
                console.error('Error upserting payroll config:', payrollError);
                return NextResponse.json({ error: 'Failed to save payroll configuration' }, { status: 500 });
            }
        }

        // Step 3: Upsert banking info
        if (body.bankingInfo) {
            const bankingData = {
                company_id: companyId,
                bank_name: body.bankingInfo.bankName || null,
                account_type: body.bankingInfo.accountType,
                routing_number: body.bankingInfo.routingNumber || null,
                account_number_masked: body.bankingInfo.accountNumber
                    ? `****${body.bankingInfo.accountNumber.slice(-4)}`
                    : null,
                account_number_encrypted: body.bankingInfo.accountNumber || null, // TODO: Encrypt this
                use_mercury: body.bankingInfo.useMercury,
            };

            const { error: bankingError } = await supabase
                .from('employer_banking')
                .upsert(bankingData, { onConflict: 'company_id' });

            if (bankingError) {
                console.error('Error upserting banking:', bankingError);
                return NextResponse.json({ error: 'Failed to save banking information' }, { status: 500 });
            }
        }

        // Step 4: Upsert benefits config
        if (body.benefitsConfig) {
            const benefitsData = {
                company_id: companyId,
                offers_health_insurance: body.benefitsConfig.offersHealthInsurance,
                health_insurance_provider: body.benefitsConfig.healthInsuranceProvider || null,
                health_employer_contribution_pct: body.benefitsConfig.healthEmployerContributionPct,
                offers_401k: body.benefitsConfig.offers401k,
                has_employer_match: body.benefitsConfig.hasEmployerMatch,
                employer_match_pct: body.benefitsConfig.employerMatchPct,
                employer_match_limit_pct: body.benefitsConfig.employerMatchLimitPct,
                offers_pto: body.benefitsConfig.offersPto,
                pto_days_per_year: body.benefitsConfig.ptoDaysPerYear,
                offers_dental: body.benefitsConfig.offersDental,
                offers_vision: body.benefitsConfig.offersVision,
                offers_life_insurance: body.benefitsConfig.offersLifeInsurance,
            };

            const { error: benefitsError } = await supabase
                .from('employer_benefits_config')
                .upsert(benefitsData, { onConflict: 'company_id' });

            if (benefitsError) {
                console.error('Error upserting benefits config:', benefitsError);
                return NextResponse.json({ error: 'Failed to save benefits configuration' }, { status: 500 });
            }
        }

        // Update onboarding step if provided
        if (body.currentStep) {
            await supabase
                .from('employer_companies')
                .update({
                    onboarding_step: body.currentStep,
                    onboarding_completed: body.completed || false
                })
                .eq('id', companyId);
        }

        return NextResponse.json({
            success: true,
            companyId,
            message: 'Onboarding data saved successfully'
        });

    } catch (error) {
        console.error('POST onboarding error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
