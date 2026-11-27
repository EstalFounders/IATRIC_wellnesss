// steps/Step3Schedule.js
//
// Step 3 of 6 - when the doctor sits and what they offer. The weekly editor is
// the only source of the bookable slots (`generateSlotsForDoctor` builds them
// from `weeklyAvailability`), so at least one day with a time range is required.

import React from "react";
import { FaCalendarAlt } from "react-icons/fa";
import styles from "../AddDoctorForm.module.css";
import StepHeader from "../components/StepHeader";
import Field, { Select, TextInput } from "../components/Field";
import WeeklyAvailabilityEditor from "../../../Common/WeeklyAvailabilityEditor";
import { superAdminConsultationtype } from "../../../../constant";
import { SERVICES_OFFERED_ENABLED } from "../lib/addDoctorSteps.js";

const Step3Schedule = ({
  values,
  errors = {},
  selectedTypes,
  handleAddType,
  handleRemoveType,
  handleServicePriceChange,
  handleTypeClinicChange,
  selectedService,
  handleAddService,
  handleRemoveService,
  storedService,
  weeklyAvailability,
  handleWeeklyAvailabilityChange,
  workDaysError,
}) => (
  <section className={styles.card}>
    <StepHeader
      icon={FaCalendarAlt}
      title="Timings & services"
      description="Working days, consultation types with their fee and clinic, and the services offered."
    />

    {/* ① Working hours - the only source of the bookable slots. */}
    <div
      className={styles.stepSection}
      data-invalid={errors.workDays ? "true" : undefined}
    >
      <div className={styles.stepSectionHead}>
        <h3 className={styles.stepSectionTitle}>
          Work days &amp; hours <span className={styles.req}>*</span>
        </h3>
        <span className={styles.sectionBadge}>
          {weeklyAvailability.length} of 7 days
        </span>
      </div>
      <WeeklyAvailabilityEditor
        value={weeklyAvailability}
        onChange={handleWeeklyAvailabilityChange}
        error={workDaysError || errors.workDays}
      />
      <span className={styles.hint}>
        Slots are generated inside these hours. Add a second range for a lunch
        break.
      </span>
    </div>

    {/* ② Modes + fees on the left, ③ services on the right (stacked on
        mobile). The fee input sits in the row of the type it belongs to, so a
        mode is never edited in two separate places. */}
    <div className={styles.twoUp}>
      <div className={styles.stepSection}>
        <div className={styles.stepSectionHead}>
          <h3 className={styles.stepSectionTitle}>
            Consultation types <span className={styles.req}>*</span>
          </h3>
          <span className={styles.sectionBadge}>
            {selectedTypes.length} added
          </span>
        </div>

        <Field
          label="Add a consultation type"
          htmlFor="consultationType"
          required
          error={errors.consultationType}
          hint="Pick every mode the doctor offers, then set a fee below."
        >
          <Select
            id="consultationType"
            value=""
            onChange={handleAddType}
            error={errors.consultationType}
          >
            <option value="" disabled>
              Select options
            </option>
            {superAdminConsultationtype.map((option) => (
              <option
                key={option.name}
                value={option.name}
                disabled={selectedTypes.some((item) => item.name === option.name)}
              >
                {option.name}
              </option>
            ))}
          </Select>
        </Field>

        {selectedTypes.length > 0 ? (
          <div className={styles.feeRows}>
            <span className={styles.subLabel}>
              Fee per consultation type (₹)
            </span>
            {selectedTypes.map((type) => (
              <div key={type.name} className={styles.feeBlock}>
                <div className={styles.feeRow}>
                  <span className={styles.feeName}>{type.name}</span>
                  <span className={styles.feeInputWrap}>
                    <span className={styles.feeCurrency} aria-hidden="true">
                      ₹
                    </span>
                    <TextInput
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={type.price ?? ""}
                      onChange={(event) =>
                        handleServicePriceChange(type.name, event.target.value)
                      }
                      placeholder="e.g. 500"
                      aria-label={`${type.name} fee`}
                      className={styles.feeInput}
                    />
                  </span>
                  <button
                    type="button"
                    className={styles.feeRemove}
                    aria-label={`Remove ${type.name}`}
                    onClick={() => handleRemoveType(type.name)}
                  >
                    ✖
                  </button>
                </div>
                {/* Clinic details for this type - both optional. */}
                <div className={styles.clinicRow}>
                  <TextInput
                    value={type.clinicName ?? ""}
                    onChange={(event) =>
                      handleTypeClinicChange(
                        type.name,
                        "clinicName",
                        event.target.value
                      )
                    }
                    placeholder="Clinic name"
                    aria-label={`${type.name} clinic name`}
                    className={styles.clinicInput}
                  />
                  <TextInput
                    value={type.clinicLocation ?? ""}
                    onChange={(event) =>
                      handleTypeClinicChange(
                        type.name,
                        "clinicLocation",
                        event.target.value
                      )
                    }
                    placeholder="Clinic location"
                    aria-label={`${type.name} clinic location`}
                    className={styles.clinicInput}
                  />
                </div>
              </div>
            ))}
            <span className={styles.hint}>
              Optional - a type without a fee shows &quot;Fee details not
              listed&quot; on the public card. The clinic name and location are
              optional too; fill them where patients attend that type.
            </span>
          </div>
        ) : (
          <p className={styles.emptyNote}>
            No consultation type added yet - pick one above.
          </p>
        )}
      </div>

      <div
        className={`${styles.stepSection} ${
          SERVICES_OFFERED_ENABLED ? "" : styles.sectionOff
        }`}
      >
        <div className={styles.stepSectionHead}>
          <h3 className={styles.stepSectionTitle}>
            Services offered{" "}
            {SERVICES_OFFERED_ENABLED ? <span className={styles.req}>*</span> : null}
          </h3>
          <span
            className={`${styles.sectionBadge} ${
              SERVICES_OFFERED_ENABLED ? "" : styles.badgeOff
            }`}
          >
            {SERVICES_OFFERED_ENABLED ? `${selectedService.length} added` : "off"}
          </span>
        </div>

        <Field
          label="Add a service"
          htmlFor="ServicesOffered"
          required={SERVICES_OFFERED_ENABLED}
          error={SERVICES_OFFERED_ENABLED ? errors.serviceOffered : undefined}
          hint={
            SERVICES_OFFERED_ENABLED
              ? "Shown as the doctor's speciality on the listing card."
              : "Turned off for now - you can add services later from the doctor's profile."
          }
        >
          <Select
            id="ServicesOffered"
            value=""
            onChange={handleAddService}
            error={SERVICES_OFFERED_ENABLED ? errors.serviceOffered : undefined}
            disabled={!SERVICES_OFFERED_ENABLED}
          >
            <option value="" disabled>
              {SERVICES_OFFERED_ENABLED
                ? "Select options"
                : "Services are turned off"}
            </option>
            {(storedService || [])
              .filter((option) => option.isActive !== false)
              .map((option) => (
                <option
                  key={option._id || option.name}
                  value={option.name}
                  disabled={selectedService.includes(option.name)}
                >
                  {option.name}
                </option>
              ))}
          </Select>
        </Field>

        {selectedService.length > 0 ? (
          <div className={styles.tagsContainer}>
            {selectedService.map((type) => (
              <div key={type} className={styles.tag}>
                {type}
                {SERVICES_OFFERED_ENABLED ? (
                  <button
                    type="button"
                    className={styles.removeButton}
                    aria-label={`Remove ${type}`}
                    onClick={() => handleRemoveService(type)}
                  >
                    ✖
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyNote}>
            {SERVICES_OFFERED_ENABLED
              ? "No service added yet - pick one above."
              : "Services are optional for now - this field is turned off."}
          </p>
        )}
      </div>
    </div>

    {/* ④ One glance at what this step has collected so far. */}
    <div className={styles.summaryStrip}>
      <span className={styles.summaryChip}>
        <strong>{weeklyAvailability.length}</strong> work day
        {weeklyAvailability.length === 1 ? "" : "s"}
      </span>
      <span className={styles.summaryChip}>
        <strong>{selectedTypes.length}</strong> consultation type
        {selectedTypes.length === 1 ? "" : "s"}
      </span>
      <span className={styles.summaryChip}>
        {SERVICES_OFFERED_ENABLED ? (
          <>
            <strong>{selectedService.length}</strong> service
            {selectedService.length === 1 ? "" : "s"}
          </>
        ) : (
          "services off"
        )}
      </span>
    </div>
    <p className={styles.hint}>
      Working days for {values.name || "this doctor"} are summarised as{" "}
      <strong>{values.workDays || "no days yet"}</strong>.
    </p>
  </section>
);

export default Step3Schedule;
