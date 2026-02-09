/**
 * Turbo initialization module
 *
 * Initializes Hotwire Turbo and disables Turbo Drive.
 * Only Turbo Frames are used in the admin app.
 */
import * as Turbo from '@hotwired/turbo'

// Disable Turbo Drive - only use Turbo Frames
Turbo.session.drive = false

// Expose globally for existing component code
window.Turbo = Turbo

export { Turbo }