import { createClient } from '@/lib/supabase/client'

export async function seedInitialDataForUser(userId: string) {
  const supabase = createClient()
  
  // Check if user already has data
  const { data: existingItems } = await supabase
    .from('items')
    .select('id')
    .eq('user_id', userId)
    .limit(1)

  if (existingItems && existingItems.length > 0) {
    // User already has data, don't seed
    return
  }

  // Seed some default items and sizes for new users
  const defaultItems = [
    'T-Shirt',
    'Jeans', 
    'Hoodie',
    'Sneakers'
  ]

  const defaultSizes = [
    'XS',
    'S', 
    'M',
    'L',
    'XL',
    'XXL'
  ]

  try {
    // Insert default items
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .insert(defaultItems.map(name => ({ name, user_id: userId })))
      .select()

    if (itemsError) {
      console.error('Error seeding items:', itemsError)
      return
    }

    // Insert default sizes
    const { data: sizes, error: sizesError } = await supabase
      .from('sizes')  
      .insert(defaultSizes.map(name => ({ name, user_id: userId })))
      .select()

    if (sizesError) {
      console.error('Error seeding sizes:', sizesError)
      return
    }

    console.log('Successfully seeded initial data for new user')
  } catch (error) {
    console.error('Error seeding initial data:', error)
  }
}
