# Requirements
### Authentication & Profile Management

1.1. User should be able to sign up / login into their profile on the buddy platform 1.2. Users can create, view, and update their profiles with personal information including:
- Basic details (name, email, phone, date of birth, gender)
- Address information with Singapore as default country
- Profile bio and profile image
- Emergency contact information
- Interests, mobility level, activity preferences, and language preferences (stored as JSONB)

1.3. Profile verification system to mark users as verified 
1.4. User types should include regular users and staff accounts with different permissions 
1.5. Users can view other users' profiles (read-only access to public profile information)

### Activities & Opportunities Management

2.1. Users should be given a list of activities (opportunities) which will be displayed 
2.2. Within the activity page, it should contain:
- Activity details (title, description, category, datetime, location)
- Registration page with autofilled user information
- List of profiles who are interested in the same activity
- Option to provide their buddy UID which will be shown in their buddy relationships 

2.3. Staff accounts can create, update, and delete opportunities 
2.4. Activities should support:
- Age and mobility requirements
- Required items list
- Current participant count tracking
- Incentive information (type, value, description) 
2.5. Users can view all active opportunities without authentication, but must be authenticated to register
### Registration System

3.1. Authenticated users can register for activities 
3.2. Registration form should autofill user information from their profile 
3.3. Users can specify a buddy (by UID) when registering 
3.4. Registration should capture:

- Special requirements
- Emergency contact (can override profile defaults)
- Status tracking (registered, confirmed, attended, cancelled, no-show) 3.5. Users can update their registration status 3.6. Prevent duplicate registrations for the same activity 3.7. Post-activity feedback system (rating and comments)
### Buddy Relationship System

4.1. Authenticated users can create, view, and update buddy relationships 
4.2. Buddy relationship features:
- Send buddy requests with different relationship types (buddy, activity-partner, mentor, friend)
- Accept, decline, or block buddy requests
- Track how relationships were initiated (swipe, activity, suggestion)
- Monitor interaction history and activities done together 

4.3. Swiping mechanism:
- Users can swipe "yes" or "no" on other profiles
- Prevent multiple swipes on the same profile
- Track swipe history for matching algorithm 4.4. Mutual matching system when both users swipe "yes" on each other
### Incentives Management

5.1. Staff accounts can create, update, and delete incentives 
5.2. Incentives should have:
- Description of the reward
- Point values 
5.3. Link incentives to opportunities and registrations 
5.4. Track incentive claiming status and timestamps 5.5. 
Users can view available incentives
### Accessibility Features

6.1. Text-to-Speech (TTS) functionality for authenticated users 
6.2. Speech-to-Text (STT) functionality for authenticated users 
6.3. Support for multiple language preferences 
6.4. Mobility level considerations in activity matching 
6.5. Large, clear UI elements suitable for elderly users
## 7. Security & Permissions

7.1. Authentication required for all Create, Update, Delete operations 
7.2. Staff-only permissions for:
- Managing opportunities (Create, Update, Delete)
- Managing incentives (Create, Update, Delete) 
7.3. User-specific permissions for:
- Own profile management
- Registration management
- Buddy relationship management 
7.4. Public read access for viewing opportunities and basic profile information

## 8. Data Management & Tracking

8.1. Automatic timestamp tracking for all records (created_at, updated_at) 
8.2. Activity participation tracking and statistics 
8.3. User engagement metrics (last active time, total activities) 
8.4. Soft delete capabilities with is_active flags 
8.5. Emergency contact override options for activities 
8.6. Profile verification status tracking

# System Architecture
![[system arch.png]]

# FastAPI Endpoints

- CRUD for profiles (CUD for authenticated)
- CRU for registrations (must be authenticated)
- CRUD for buddy relationships (must be authenticated)
- CRUD for opportunities (CUD for staff accounts defined in user types)
- CRUD for incentives (CUD for staff accounts defined in user types)
- TTS (authenticated)
- STT (authenticated)

# Database Tables
```SQL

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say')),
    
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    postal_code VARCHAR(10),
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Singapore',
    
    bio TEXT,
    profile_image_url VARCHAR(500),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    
    interests JSONB, -- e.g. ["reading", "walking", "cooking", "gardening"]
    mobility_level VARCHAR(50) CHECK (mobility_level IN ('high', 'moderate', 'low', 'wheelchair')),
    activity_preferences JSONB, -- e.g. ["indoor", "outdoor", "social", "quiet"]
    language_preferences JSONB, -- e.g. ["english", "mandarin", "malay", "tamil"]
    
    -- App-specific fields
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_active_at TIMESTAMP WITH TIME ZONE,
    user_type VARCHAR(20),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category JSONB, -- e.g., ["exercise", "social", "educational", "cultural"]
    
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE,
    location_name VARCHAR(200),
    location_address TEXT,
    
    current_participants INTEGER DEFAULT 0,
    
    incentive_type VARCHAR(50), -- e.g., "points", "voucher", "certificate"
    incentive_value INTEGER, -- points value or voucher amount
    incentive_description TEXT,
    
    min_age INTEGER,
    max_age INTEGER,
    mobility_requirements VARCHAR(100),
    required_items JSONB, -- e.g., ["comfortable shoes", "water bottle"]
    
    created_by UUID REFERENCES profiles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    buddy_id UUID REFERENCES profiles(id),
    
    status VARCHAR(50) DEFAULT 'registered' 
        CHECK (status IN ('registered', 'confirmed', 'attended', 'cancelled', 'no-show')),
    
    special_requirements TEXT,
    emergency_contact_override VARCHAR(100), -- can autofill from profile
    emergency_phone_override VARCHAR(20), -- can autofill from profile
    
    incentive_id UUID,
    incentive_claimed BOOLEAN DEFAULT false,
    incentive_claimed_at TIMESTAMP WITH TIME ZONE,
    
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT,
    
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(profile_id, opportunity_id),
    CHECK (buddy_id IS NULL OR buddy_id != profile_id)
);

CREATE TABLE buddy_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    profile1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    profile2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    status VARCHAR(50) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'accepted', 'declined', 'blocked', 'inactive')),
    relationship_type VARCHAR(50) DEFAULT 'buddy'
        CHECK (relationship_type IN ('buddy', 'activity-partner', 'mentor', 'friend')),
    
    initiated_by UUID NOT NULL REFERENCES profiles(id),
    matched_through VARCHAR(100), -- e.g. "swipe", "activity", "suggestion"
    first_message_sent BOOLEAN DEFAULT false,
    last_interaction_at TIMESTAMP WITH TIME ZONE,
    total_activities_together INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (profile1_id != profile2_id),
    UNIQUE(profile1_id, profile2_id)
);

CREATE TABLE swipe_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    swiper_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    swiped_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('yes', 'no')),
    
    swiped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(swiper_id, swiped_profile_id),
    CHECK (swiper_id != swiped_profile_id
);

CREATE TABLE incentives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT,
    points INTEGER
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at column
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buddy_relationships_updated_at BEFORE UPDATE ON buddy_relationships 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 
```